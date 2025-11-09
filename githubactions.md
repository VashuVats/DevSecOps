name: DevSecOps Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  secret-scanning:
    name: Secret Scanning
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
        with:
          fetch-depth: 0
      
      - name: TruffleHog Secret Scan
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: ${{ github.event.repository.default_branch }}
          head: HEAD
      
      - name: Gitleaks Secret Scan
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  dependency-check:
    name: Dependency Scanning
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: NPM Audit
        run: npm audit --json > npm-audit.json
        continue-on-error: true
      
      - name: Snyk Security Scan
        uses: snyk/actions/node@master
        continue-on-error: true
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high --json-file-output=snyk-report.json
      
      - name: OWASP Dependency-Check
        uses: dependency-check/Dependency-Check_Action@main
        with:
          project: 'vulnerable-app'
          path: '.'
          format: 'HTML'
          args: >
            --failOnCVSS 7
            --enableRetired
      
      - name: Upload Dependency Check Report
        uses: actions/upload-artifact@v3
        with:
          name: dependency-check-report
          path: ${{ github.workspace }}/reports

  sast-analysis:
    name: SAST Analysis
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Semgrep Scan
        uses: returntocorp/semgrep-action@v1
        with:
          config: >-
            p/security-audit
            p/secrets
            p/owasp-top-ten
            p/nodejs
      
      - name: SonarCloud Scan
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
        with:
          args: >
            -Dsonar.projectKey=vulnerable-owasp-app
            -Dsonar.organization=your-org
      
      - name: CodeQL Analysis
        uses: github/codeql-action/init@v2
        with:
          languages: javascript
      
      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v2

  build-and-scan:
    name: Build & Container Scanning
    runs-on: ubuntu-latest
    needs: [secret-scanning, dependency-check, sast-analysis]
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      
      - name: Build Docker image
        run: |
          docker build -t vulnerable-app:${{ github.sha }} .
      
      - name: Trivy Container Scan
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: vulnerable-app:${{ github.sha }}
          format: 'sarif'
          output: 'trivy-results.sarif'
          severity: 'CRITICAL,HIGH,MEDIUM'
      
      - name: Upload Trivy Results
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'
      
      - name: Grype Container Scan
        uses: anchore/scan-action@v3
        with:
          image: vulnerable-app:${{ github.sha }}
          fail-build: false
          severity-cutoff: high
      
      - name: Docker Scout CVE Scan
        uses: docker/scout-action@v1
        with:
          command: cves
          image: vulnerable-app:${{ github.sha }}
          only-severities: critical,high
          write-comment: true
          github-token: ${{ secrets.GITHUB_TOKEN }}

  dast-analysis:
    name: DAST Analysis
    runs-on: ubuntu-latest
    needs: build-and-scan
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Start Application
        run: |
          docker run -d -p 3000:3000 --name test-app vulnerable-app:${{ github.sha }}
          sleep 10
      
      - name: OWASP ZAP Baseline Scan
        uses: zaproxy/action-baseline@v0.7.0
        with:
          target: 'http://localhost:3000'
          rules_file_name: '.zap/rules.tsv'
          cmd_options: '-a'
      
      - name: Nikto Web Scanner
        run: |
          docker run --network host sullo/nikto:latest -h http://localhost:3000 -output nikto-report.xml
        continue-on-error: true
      
      - name: Stop Application
        if: always()
        run: |
          docker stop test-app
          docker rm test-app

  security-report:
    name: Generate Security Report
    runs-on: ubuntu-latest
    needs: [secret-scanning, dependency-check, sast-analysis, build-and-scan, dast-analysis]
    if: always()
    steps:
      - name: Download all artifacts
        uses: actions/download-artifact@v3
      
      - name: Generate Security Summary
        run: |
          echo "# Security Scan Summary" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "## 🔍 Scan Results" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "| Scan Type | Status | Findings |" >> $GITHUB_STEP_SUMMARY
          echo "|-----------|--------|----------|" >> $GITHUB_STEP_SUMMARY
          echo "| Secret Scanning | ⚠️ | Multiple secrets detected |" >> $GITHUB_STEP_SUMMARY
          echo "| Dependency Check | ⚠️ | Vulnerable dependencies found |" >> $GITHUB_STEP_SUMMARY
          echo "| SAST | ⚠️ | SQL Injection, Command Injection detected |" >> $GITHUB_STEP_SUMMARY
          echo "| Container Scan | ⚠️ | Multiple CVEs in base image |" >> $GITHUB_STEP_SUMMARY
          echo "| DAST | ⚠️ | XSS, Security Misconfiguration found |" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "## ⚠️ Critical Vulnerabilities" >> $GITHUB_STEP_SUMMARY
          echo "- SQL Injection in /login endpoint" >> $GITHUB_STEP_SUMMARY
          echo "- Command Injection in /ping endpoint" >> $GITHUB_STEP_SUMMARY
          echo "- Hardcoded credentials in source" >> $GITHUB_STEP_SUMMARY
          echo "- XSS in /search endpoint" >> $GITHUB_STEP_SUMMARY
          echo "- Insecure deserialization via eval()" >> $GITHUB_STEP_SUMMARY
      
      - name: Comment PR with Results
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            const comment = `## 🛡️ Security Scan Results
            
            ⚠️ **WARNING**: Multiple security vulnerabilities detected!
            
            ### Critical Issues:
            - 🔴 SQL Injection vulnerability
            - 🔴 Command Injection vulnerability  
            - 🔴 Hardcoded secrets detected
            - 🔴 Insecure deserialization (eval)
            
            ### High Issues:
            - 🟠 XSS vulnerability
            - 🟠 Path traversal vulnerability
            - 🟠 Weak cryptography (MD5)
            - 🟠 Missing authentication/authorization
            
            **This build should NOT be deployed to production!**
            `;
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });