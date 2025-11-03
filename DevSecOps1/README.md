# 🔐 DevSecOps Project: OWASP Top 10 Vulnerable Application

[![Security](https://img.shields.io/badge/Security-Vulnerable-red)](https://owasp.org/www-project-top-ten/)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-Jenkins-blue)](https://www.jenkins.io/)
[![Cloud](https://img.shields.io/badge/Cloud-AWS-orange)](https://aws.amazon.com/)
[![Monitoring](https://img.shields.io/badge/Monitoring-Prometheus%20%2B%20Grafana-green)](https://prometheus.io/)

> ⚠️ **WARNING**: This application is intentionally vulnerable and should **NEVER** be deployed in a production environment or exposed to the internet!

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Technologies Used](#technologies-used)
- [OWASP Top 10 Vulnerabilities Demonstrated](#owasp-top-10-vulnerabilities-demonstrated)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Local Setup](#local-setup)
- [AWS Deployment](#aws-deployment)
- [CI/CD Pipeline](#cicd-pipeline)
- [Monitoring & Observability](#monitoring--observability)
- [Security Scanning Tools](#security-scanning-tools)
- [Testing Vulnerabilities](#testing-vulnerabilities)
- [Resume Highlights](#resume-highlights)
- [Learning Outcomes](#learning-outcomes)

## 🎯 Overview

This is a comprehensive DevSecOps project demonstrating security vulnerabilities, automated security scanning, CI/CD pipeline implementation, cloud deployment, and real-time monitoring. The project showcases practical implementation of security best practices in a DevOps environment.

### Key Features

- ✅ Intentionally vulnerable Node.js web application with OWASP Top 10 vulnerabilities
- ✅ Complete Jenkins CI/CD pipeline with multiple security scanning stages
- ✅ Infrastructure as Code using Terraform for AWS deployment
- ✅ Containerization with Docker and Docker Compose
- ✅ Real-time monitoring with Prometheus and Grafana
- ✅ Automated security scanning (SAST, DAST, SCA, Container Scanning)
- ✅ Alert management with Alertmanager
- ✅ CloudWatch integration for AWS monitoring

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Developer                                │
│                            ↓                                     │
│                    Push Code to Git                              │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Jenkins CI/CD Pipeline                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 1. Checkout Code                                          │  │
│  │ 2. Install Dependencies                                   │  │
│  │ 3. SAST (SonarQube, Semgrep)                             │  │
│  │ 4. Dependency Check (OWASP Dependency Check)             │  │
│  │ 5. Secret Scanning (Trufflehog)                          │  │
│  │ 6. Build Docker Image                                     │  │
│  │ 7. Container Scan (Trivy, Grype)                         │  │
│  │ 8. Push to Registry                                       │  │
│  │ 9. Deploy to AWS EC2                                      │  │
│  │ 10. DAST (OWASP ZAP)                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                      AWS Infrastructure                          │
│  ┌────────────────┐  ┌────────────────┐  ┌─────────────────┐  │
│  │  VPC & Subnets │  │  Security      │  │  EC2 Instances  │  │
│  │                │  │  Groups        │  │  - App Server   │  │
│  │  - Public      │  │                │  │  - Jenkins      │  │
│  │  - Route Table │  │  - App SG      │  │                 │  │
│  │  - IGW         │  │  - Jenkins SG  │  │                 │  │
│  └────────────────┘  └────────────────┘  └─────────────────┘  │
│                                                                  │
│  ┌────────────────┐  ┌────────────────┐  ┌─────────────────┐  │
│  │  CloudWatch    │  │  SNS Topics    │  │  IAM Roles      │  │
│  │  - Logs        │  │  - Alerts      │  │  - EC2 Profile  │  │
│  │  - Metrics     │  │                │  │                 │  │
│  └────────────────┘  └────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                   Monitoring Stack (Docker)                      │
│  ┌────────────────┐  ┌────────────────┐  ┌─────────────────┐  │
│  │  Prometheus    │→ │  Grafana       │  │  Alertmanager   │  │
│  │  :9090         │  │  :3001         │  │  :9093          │  │
│  └────────────────┘  └────────────────┘  └─────────────────┘  │
│          ↑                                                       │
│  ┌────────────────┐  ┌────────────────┐                        │
│  │  Node Exporter │  │  cAdvisor      │                        │
│  │  :9100         │  │  :8080         │                        │
│  └────────────────┘  └────────────────┘                        │
└─────────────────────────────────────────────────────────────────┘
```

## 🛠️ Technologies Used

### Application Stack
- **Runtime**: Node.js 18
- **Framework**: Express.js
- **Database**: SQLite3
- **Session Management**: express-session
- **Authentication**: JWT (jsonwebtoken)

### DevOps Tools
- **Containerization**: Docker, Docker Compose
- **CI/CD**: Jenkins
- **IaC**: Terraform
- **Cloud Provider**: AWS (EC2, VPC, CloudWatch, SNS)
- **Version Control**: Git

### Security Scanning Tools
- **SAST**: SonarQube, Semgrep
- **SCA**: OWASP Dependency Check
- **Secret Scanning**: Trufflehog
- **Container Scanning**: Trivy, Grype
- **DAST**: OWASP ZAP

### Monitoring & Observability
- **Metrics Collection**: Prometheus
- **Visualization**: Grafana
- **Alerting**: Alertmanager
- **System Metrics**: Node Exporter
- **Container Metrics**: cAdvisor
- **Cloud Monitoring**: AWS CloudWatch

## 🔓 OWASP Top 10 Vulnerabilities Demonstrated

### A01:2021 – Broken Access Control
- Direct object reference without authentication (`/user/:id`)
- Missing authorization checks on admin endpoints (`/admin`)
- Insecure session configuration

### A02:2021 – Cryptographic Failures
- Plain text password storage
- Exposed API keys (`/api/keys`)
- Weak JWT secret
- MD5 hashing (cryptographically broken)

### A03:2021 – Injection
- SQL Injection in login (`/login`)
- SQL Injection in search (`/search`)
- Command Injection (`/ping`)
- Code Injection via `eval()` (`/import-data`)

### A04:2021 – Insecure Design
- Password reset without verification (`/reset-password`)
- No rate limiting on authentication
- Weak password policy

### A05:2021 – Security Misconfiguration
- Debug endpoint exposing sensitive info (`/debug`)
- Exposed environment file (`/.env`)
- CORS misconfiguration (allows all origins)
- Verbose error messages with stack traces

### A06:2021 – Vulnerable and Outdated Components
- Using potentially outdated npm packages
- No automated dependency updates

### A07:2021 – Identification and Authentication Failures
- No account lockout mechanism
- Weak password requirements
- No multi-factor authentication
- Session fixation vulnerabilities

### A08:2021 – Software and Data Integrity Failures
- Insecure file upload (`/upload`)
- No integrity checks on uploaded files
- Insecure deserialization

### A09:2021 – Security Logging and Monitoring Failures
- No logging of security events
- No failed login attempt tracking
- Missing audit trails

### A10:2021 – Server-Side Request Forgery (SSRF)
- Unvalidated URL fetching (`/fetch-url`)
- Can access internal resources

### Additional Vulnerabilities
- **XSS (Cross-Site Scripting)**: Stored XSS in comments (`/comment`)
- **Path Traversal**: File download without validation (`/download`)
- **Mass Assignment**: User can set their own role in registration
- **Information Disclosure**: Exposing sensitive system information

## 📁 Project Structure

```
DevSecOps/
├── vulnerable.js              # Main vulnerable application
├── package.json               # Node.js dependencies
├── Dockerfile                 # Container image definition
├── docker-compose.yml         # Multi-container orchestration
├── Jenkinsfile               # CI/CD pipeline definition
├── sonar-project.properties  # SonarQube configuration
├── .gitignore                # Git ignore rules
├── .dockerignore             # Docker ignore rules
│
├── terraform/                # Infrastructure as Code
│   ├── main.tf              # Main Terraform configuration
│   ├── variables.tf         # Input variables
│   ├── outputs.tf           # Output values
│   ├── user-data-app.sh     # EC2 app server initialization
│   └── user-data-jenkins.sh # EC2 Jenkins server initialization
│
├── monitoring/               # Monitoring configuration
│   ├── prometheus.yml       # Prometheus configuration
│   ├── alerts.yml           # Alert rules
│   ├── alertmanager.yml     # Alertmanager configuration
│   └── grafana/
│       ├── datasources.yml  # Grafana data sources
│       └── dashboards/
│           └── dashboard.json
│
└── docs/                     # Additional documentation
    ├── SETUP.md
    ├── VULNERABILITIES.md
    └── TROUBLESHOOTING.md
```

## 📦 Prerequisites

### Local Development
- Node.js 18+ and npm
- Docker and Docker Compose
- Git

### AWS Deployment
- AWS Account with appropriate permissions
- AWS CLI configured
- Terraform installed
- SSH key pair for EC2 access

### Jenkins Setup
- Jenkins server (can be deployed via Terraform)
- Required Jenkins plugins (see Jenkinsfile)
- Docker access for Jenkins

## 🚀 Local Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd DevSecOps
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Application Locally

```bash
# Start the application
npm start

# Application will be available at http://localhost:3000
```

### 4. Run with Docker

```bash
# Build the image
docker build -t vulnerable-app .

# Run the container
docker run -p 3000:3000 vulnerable-app
```

### 5. Run Complete Stack with Monitoring

```bash
# Start all services (app + monitoring)
docker-compose up -d

# Access services:
# - Application: http://localhost:3000
# - Prometheus: http://localhost:9090
# - Grafana: http://localhost:3001 (admin/admin123)
# - cAdvisor: http://localhost:8080
```

## ☁️ AWS Deployment

### 1. Configure Terraform Variables

Create `terraform/terraform.tfvars`:

```hcl
aws_region       = "us-east-1"
project_name     = "devsecops-owasp"
environment      = "dev"
ssh_public_key   = "ssh-rsa AAAAB3... your-public-key"
alert_email      = "your-email@example.com"
allowed_ssh_cidr = "YOUR_IP/32"  # Replace with your IP
```

### 2. Initialize and Deploy Infrastructure

```bash
cd terraform

# Initialize Terraform
terraform init

# Review the plan
terraform plan

# Apply the configuration
terraform apply

# Note the outputs (IPs, URLs, SSH commands)
terraform output
```

### 3. Access Deployed Resources

After deployment, Terraform will output:
- Application URL
- Jenkins URL
- Prometheus URL
- Grafana URL
- SSH commands for both servers

### 4. Configure Jenkins

1. SSH into Jenkins server:
   ```bash
   ssh -i ~/.ssh/your-key.pem ec2-user@<jenkins-ip>
   ```

2. Get initial admin password:
   ```bash
   cat /home/ec2-user/jenkins-info.txt
   ```

3. Access Jenkins UI and complete setup
4. Configure credentials:
   - Docker Hub credentials
   - AWS credentials
   - GitHub credentials
   - EC2 SSH key

5. Create a new pipeline job pointing to your repository

## 🔄 CI/CD Pipeline

The Jenkins pipeline includes the following stages:

### 1. **Checkout**
- Pulls code from Git repository

### 2. **Install Dependencies**
- Runs `npm install`

### 3. **SAST - SonarQube Analysis**
- Static code analysis
- Code quality metrics
- Security hotspot detection

### 4. **Quality Gate**
- Waits for SonarQube quality gate result

### 5. **Dependency Check**
- OWASP Dependency Check
- Identifies vulnerable dependencies

### 6. **Secret Scanning**
- Trufflehog for hardcoded secrets
- API keys, passwords, tokens

### 7. **SAST - Semgrep**
- Additional static analysis
- Pattern-based security checks

### 8. **Build Docker Image**
- Creates container image
- Tags with build number

### 9. **Container Security Scan**
- Trivy: CVE scanning
- Grype: Vulnerability detection

### 10. **Push to Registry**
- Pushes image to Docker Hub

### 11. **Deploy to AWS EC2**
- SSH to EC2 instance
- Pulls latest image
- Restarts container

### 12. **DAST - OWASP ZAP**
- Dynamic application security testing
- Runtime vulnerability detection

### 13. **Performance Testing**
- Load testing with k6 (optional)

## 📊 Monitoring & Observability

### Prometheus Metrics

Access Prometheus at `http://<app-ip>:9090`

**Key Metrics Collected:**
- Application uptime
- HTTP request rates
- Response times
- Error rates
- CPU usage
- Memory usage
- Disk usage
- Container metrics

### Grafana Dashboards

Access Grafana at `http://<app-ip>:3001`
- **Default credentials**: admin / admin123

**Available Dashboards:**
- Application Overview
- System Metrics
- Container Metrics
- Custom DevSecOps Dashboard

### Alertmanager

Access Alertmanager at `http://<app-ip>:9093`

**Configured Alerts:**
- Application down
- High CPU usage (>80%)
- High memory usage (>85%)
- High disk usage (>85%)
- Container down
- High error rate (>5%)
- High response time (>1s)

### CloudWatch Integration

AWS CloudWatch automatically collects:
- EC2 instance metrics
- Custom application metrics
- Log aggregation
- SNS notifications for critical alerts

## 🔍 Security Scanning Tools

### SonarQube
- **Purpose**: Static Application Security Testing (SAST)
- **Detects**: Code smells, bugs, security vulnerabilities
- **Integration**: Jenkins pipeline stage

### OWASP Dependency Check
- **Purpose**: Software Composition Analysis (SCA)
- **Detects**: Known vulnerabilities in dependencies
- **Output**: HTML and JSON reports

### Trufflehog
- **Purpose**: Secret scanning
- **Detects**: API keys, passwords, tokens in code
- **Scans**: Git history and filesystem

### Semgrep
- **Purpose**: SAST with pattern matching
- **Detects**: Security anti-patterns
- **Rules**: OWASP Top 10, CWE patterns

### Trivy
- **Purpose**: Container vulnerability scanning
- **Detects**: OS and application vulnerabilities
- **Severity**: HIGH and CRITICAL

### Grype
- **Purpose**: Container and filesystem scanning
- **Detects**: CVEs in dependencies
- **Database**: Regularly updated vulnerability DB

### OWASP ZAP
- **Purpose**: Dynamic Application Security Testing (DAST)
- **Detects**: Runtime vulnerabilities
- **Mode**: Baseline scan

## 🧪 Testing Vulnerabilities

### SQL Injection

```bash
# Login bypass
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin' OR '1'='1&password=anything"

# Data extraction
curl -X POST http://localhost:3000/search \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "query=' UNION SELECT username, password, email, role, api_key FROM users--"
```

### Command Injection

```bash
curl -X POST http://localhost:3000/ping \
  -H "Content-Type: application/json" \
  -d '{"host":"127.0.0.1; whoami"}'
```

### XSS (Cross-Site Scripting)

```bash
curl -X POST http://localhost:3000/comment \
  -H "Content-Type: application/json" \
  -d '{"comment":"<script>alert(\"XSS\")</script>"}'
```

### Broken Access Control

```bash
# Access any user's data
curl http://localhost:3000/user/1
curl http://localhost:3000/user/2

# Access admin panel (without authentication)
curl http://localhost:3000/admin
```

### SSRF

```bash
curl -X POST http://localhost:3000/fetch-url \
  -H "Content-Type: application/json" \
  -d '{"url":"http://169.254.169.254/latest/meta-data/"}'
```

## 📝 Resume Highlights

This project demonstrates expertise in:

### DevSecOps Skills
- ✅ Implemented comprehensive CI/CD pipeline with Jenkins
- ✅ Integrated multiple security scanning tools (SAST, DAST, SCA)
- ✅ Automated vulnerability detection and reporting
- ✅ Shift-left security approach

### Cloud & Infrastructure
- ✅ Deployed infrastructure on AWS using Terraform (IaC)
- ✅ Configured VPC, Security Groups, EC2, CloudWatch
- ✅ Implemented auto-scaling and high availability patterns
- ✅ Cost optimization with appropriate instance sizing

### Containerization
- ✅ Created multi-stage Docker builds
- ✅ Orchestrated services with Docker Compose
- ✅ Implemented container security best practices
- ✅ Vulnerability scanning of container images

### Monitoring & Observability
- ✅ Set up Prometheus for metrics collection
- ✅ Created custom Grafana dashboards
- ✅ Configured alerting with Alertmanager
- ✅ Integrated CloudWatch for cloud monitoring

### Security
- ✅ Demonstrated understanding of OWASP Top 10
- ✅ Implemented security scanning at multiple stages
- ✅ Secret management and detection
- ✅ Security compliance and reporting

## 🎓 Learning Outcomes

By completing this project, you will have learned:

1. **OWASP Top 10 Vulnerabilities**
   - Understanding common web application vulnerabilities
   - How to identify and exploit security flaws
   - Mitigation strategies

2. **CI/CD Pipeline Development**
   - Jenkins pipeline as code
   - Multi-stage pipeline design
   - Integration of security tools

3. **Infrastructure as Code**
   - Terraform for AWS resource provisioning
   - Version-controlled infrastructure
   - Reproducible deployments

4. **Container Security**
   - Docker best practices
   - Image scanning and hardening
   - Runtime security

5. **Cloud Deployment**
   - AWS services (EC2, VPC, CloudWatch)
   - Security groups and network configuration
   - IAM roles and policies

6. **Monitoring & Alerting**
   - Prometheus metrics collection
   - Grafana visualization
   - Alert configuration and management

7. **DevSecOps Culture**
   - Security as code
   - Automated security testing
   - Continuous security monitoring

## 🔧 Troubleshooting

### Application won't start
```bash
# Check logs
docker logs vulnerable-app

# Verify port availability
netstat -an | grep 3000
```

### Jenkins pipeline fails
```bash
# Check Jenkins logs
sudo journalctl -u jenkins -f

# Verify Docker access
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### Terraform apply fails
```bash
# Verify AWS credentials
aws sts get-caller-identity

# Check Terraform state
terraform state list
```

### Monitoring not working
```bash
# Check all containers
docker-compose ps

# Restart monitoring stack
docker-compose restart prometheus grafana
```

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Jenkins Documentation](https://www.jenkins.io/doc/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)

## ⚠️ Disclaimer

This application is intentionally vulnerable and created for educational purposes only. It should:
- **NEVER** be deployed in a production environment
- **NEVER** be exposed to the public internet
- **ONLY** be used in isolated, controlled environments
- **ONLY** be used for learning and testing security tools

## 📄 License

MIT License - See LICENSE file for details

## 👤 Author

**Your Name**
- LinkedIn: [Your LinkedIn]
- GitHub: [Your GitHub]
- Email: your.email@example.com

---

**⭐ If this project helped you learn DevSecOps, please star the repository!**
