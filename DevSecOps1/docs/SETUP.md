# 🚀 Detailed Setup Guide

This guide provides step-by-step instructions for setting up the complete DevSecOps project.

## Table of Contents
- [Local Development Setup](#local-development-setup)
- [Jenkins Setup](#jenkins-setup)
- [AWS Infrastructure Setup](#aws-infrastructure-setup)
- [Monitoring Setup](#monitoring-setup)
- [Security Tools Configuration](#security-tools-configuration)

## Local Development Setup

### Step 1: Install Prerequisites

#### Windows
```powershell
# Install Node.js
winget install OpenJS.NodeJS.LTS

# Install Docker Desktop
winget install Docker.DockerDesktop

# Install Git
winget install Git.Git

# Verify installations
node --version
npm --version
docker --version
git --version
```

#### Linux
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
sudo apt-get install git
```

### Step 2: Clone and Setup Project

```bash
# Clone repository
git clone <your-repo-url>
cd DevSecOps

# Install Node.js dependencies
npm install

# Verify installation
npm list
```

### Step 3: Run Application Locally

```bash
# Start the application
npm start

# Application will be running at:
# http://localhost:3000
```

### Step 4: Test Application

Open your browser and navigate to `http://localhost:3000`. You should see the vulnerable application homepage with all the OWASP Top 10 vulnerabilities listed.

### Step 5: Run with Docker

```bash
# Build Docker image
docker build -t vulnerable-app:latest .

# Run container
docker run -d -p 3000:3000 --name vulnerable-app vulnerable-app:latest

# Check logs
docker logs vulnerable-app

# Stop container
docker stop vulnerable-app
docker rm vulnerable-app
```

### Step 6: Run Complete Stack

```bash
# Start all services (app + monitoring)
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

Access the services:
- **Application**: http://localhost:3000
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/admin123)
- **cAdvisor**: http://localhost:8080
- **Alertmanager**: http://localhost:9093

## Jenkins Setup

### Option 1: Local Jenkins (Docker)

```bash
# Create Jenkins volume
docker volume create jenkins_home

# Run Jenkins container
docker run -d \
  --name jenkins \
  -p 8080:8080 -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts

# Get initial admin password
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

### Option 2: AWS EC2 Jenkins (via Terraform)

This will be automatically set up when you deploy the Terraform infrastructure (see AWS Infrastructure Setup section).

### Jenkins Initial Configuration

1. **Access Jenkins**: http://localhost:8080 (or your EC2 IP:8080)

2. **Unlock Jenkins**: Use the initial admin password

3. **Install Suggested Plugins**: Click "Install suggested plugins"

4. **Create Admin User**: Set up your admin credentials

5. **Install Additional Plugins**:
   - Go to: Manage Jenkins → Manage Plugins → Available
   - Install:
     - Docker Pipeline
     - Pipeline Stage View
     - SonarQube Scanner
     - OWASP Dependency-Check
     - SSH Agent
     - AWS Credentials
     - Git
     - Warnings Next Generation

6. **Configure Tools**:
   - Go to: Manage Jenkins → Global Tool Configuration
   - Configure:
     - JDK
     - Git
     - Docker
     - SonarQube Scanner
     - Node.js

### Configure Jenkins Credentials

Go to: Manage Jenkins → Manage Credentials → (global) → Add Credentials

1. **Docker Hub Credentials**
   - Kind: Username with password
   - ID: `dockerhub-credentials`
   - Username: Your Docker Hub username
   - Password: Your Docker Hub password/token

2. **AWS Credentials**
   - Kind: AWS Credentials
   - ID: `aws-credentials`
   - Access Key ID: Your AWS access key
   - Secret Access Key: Your AWS secret key

3. **EC2 SSH Key**
   - Kind: SSH Username with private key
   - ID: `ec2-ssh-key`
   - Username: `ec2-user`
   - Private Key: Paste your EC2 private key

4. **GitHub Credentials** (if using private repo)
   - Kind: Username with password
   - ID: `github-credentials`
   - Username: Your GitHub username
   - Password: Your GitHub personal access token

5. **EC2 Host**
   - Kind: Secret text
   - ID: `ec2-host`
   - Secret: Your EC2 instance public IP

### Create Jenkins Pipeline

1. **New Item**: Click "New Item"
2. **Name**: `DevSecOps-Pipeline`
3. **Type**: Pipeline
4. **Pipeline Definition**: Pipeline script from SCM
5. **SCM**: Git
6. **Repository URL**: Your repository URL
7. **Credentials**: Select your GitHub credentials
8. **Branch**: `*/main` or `*/master`
9. **Script Path**: `Jenkinsfile`
10. **Save**

### Configure SonarQube (Optional)

```bash
# Run SonarQube container
docker run -d \
  --name sonarqube \
  -p 9000:9000 \
  sonarqube:latest

# Access SonarQube
# URL: http://localhost:9000
# Default credentials: admin/admin
```

In Jenkins:
1. Go to: Manage Jenkins → Configure System
2. Find "SonarQube servers"
3. Add SonarQube:
   - Name: `SonarQube`
   - Server URL: `http://sonarqube:9000`
   - Server authentication token: Generate in SonarQube

## AWS Infrastructure Setup

### Step 1: Install AWS CLI and Terraform

#### Windows
```powershell
# Install AWS CLI
winget install Amazon.AWSCLI

# Install Terraform
winget install Hashicorp.Terraform
```

#### Linux
```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Install Terraform
wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update && sudo apt install terraform
```

### Step 2: Configure AWS Credentials

```bash
# Configure AWS CLI
aws configure

# Enter:
# AWS Access Key ID: YOUR_ACCESS_KEY
# AWS Secret Access Key: YOUR_SECRET_KEY
# Default region name: us-east-1
# Default output format: json

# Verify configuration
aws sts get-caller-identity
```

### Step 3: Generate SSH Key Pair

```bash
# Generate SSH key
ssh-keygen -t rsa -b 4096 -f ~/.ssh/devsecops-key

# This creates:
# - Private key: ~/.ssh/devsecops-key
# - Public key: ~/.ssh/devsecops-key.pub

# Set correct permissions
chmod 400 ~/.ssh/devsecops-key
```

### Step 4: Create Terraform Variables File

Create `terraform/terraform.tfvars`:

```hcl
# AWS Configuration
aws_region = "us-east-1"

# Project Configuration
project_name = "devsecops-owasp"
environment  = "dev"

# Network Configuration
vpc_cidr           = "10.0.0.0/16"
public_subnet_cidr = "10.0.1.0/24"

# Security Configuration
allowed_ssh_cidr = "YOUR_PUBLIC_IP/32"  # Replace with your IP

# EC2 Configuration
instance_type = "t3.small"
ami_id        = "ami-0c55b159cbfafe1f0"  # Amazon Linux 2023 (update for your region)

# SSH Key
ssh_public_key = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQ..."  # Paste your public key

# Docker Configuration
docker_image = "your-dockerhub-username/vulnerable-app:latest"

# Monitoring
alert_email = "your-email@example.com"
```

**Important**: Replace the following:
- `YOUR_PUBLIC_IP` with your actual public IP (get it from https://whatismyip.com)
- `ssh_public_key` with the content of `~/.ssh/devsecops-key.pub`
- `docker_image` with your Docker Hub image name
- `alert_email` with your email address
- `ami_id` with the latest Amazon Linux 2023 AMI for your region

### Step 5: Create S3 Bucket for Terraform State (Optional)

```bash
# Create S3 bucket for Terraform state
aws s3 mb s3://your-terraform-state-bucket --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket your-terraform-state-bucket \
  --versioning-configuration Status=Enabled

# Update terraform/main.tf backend configuration with your bucket name
```

### Step 6: Deploy Infrastructure

```bash
# Navigate to terraform directory
cd terraform

# Initialize Terraform
terraform init

# Validate configuration
terraform validate

# Preview changes
terraform plan

# Apply configuration
terraform apply

# Type 'yes' when prompted

# Wait for deployment (5-10 minutes)
```

### Step 7: Save Outputs

```bash
# Get all outputs
terraform output

# Save specific outputs
terraform output app_public_ip > ../app_ip.txt
terraform output jenkins_public_ip > ../jenkins_ip.txt

# Get SSH commands
terraform output ssh_command_app
terraform output ssh_command_jenkins
```

### Step 8: Verify Deployment

```bash
# SSH into app server
ssh -i ~/.ssh/devsecops-key ec2-user@$(terraform output -raw app_public_ip)

# Check Docker containers
docker ps

# Check application
curl http://localhost:3000/health

# Exit
exit

# SSH into Jenkins server
ssh -i ~/.ssh/devsecops-key ec2-user@$(terraform output -raw jenkins_public_ip)

# Get Jenkins initial password
cat /home/ec2-user/jenkins-info.txt

# Exit
exit
```

### Step 9: Access Services

Open your browser and navigate to:

- **Application**: `http://<app_public_ip>:3000`
- **Jenkins**: `http://<jenkins_public_ip>:8080`
- **Prometheus**: `http://<app_public_ip>:9090`
- **Grafana**: `http://<app_public_ip>:3001`

## Monitoring Setup

### Grafana Configuration

1. **Access Grafana**: http://<app_public_ip>:3001
2. **Login**: admin / admin123
3. **Change Password**: Set a new password

4. **Verify Data Source**:
   - Go to: Configuration → Data Sources
   - Prometheus should be already configured
   - Click "Test" to verify connection

5. **Import Dashboards**:
   - Go to: Dashboards → Import
   - Import ID: `1860` (Node Exporter Full)
   - Import ID: `893` (Docker and System Monitoring)
   - Import ID: `11074` (Node Exporter for Prometheus)

6. **Create Custom Dashboard**:
   - Go to: Dashboards → New Dashboard
   - Add panels for:
     - Application uptime
     - Request rate
     - Error rate
     - Response time
     - CPU usage
     - Memory usage

### Prometheus Configuration

1. **Access Prometheus**: http://<app_public_ip>:9090

2. **Verify Targets**:
   - Go to: Status → Targets
   - All targets should be "UP"

3. **Test Queries**:
   ```promql
   # Application uptime
   up{job="vulnerable-app"}
   
   # CPU usage
   100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)
   
   # Memory usage
   (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100
   ```

### Alertmanager Configuration

1. **Access Alertmanager**: http://<app_public_ip>:9093

2. **Configure Email Alerts**:
   - Edit `monitoring/alertmanager.yml`
   - Update SMTP settings:
     ```yaml
     smtp_smarthost: 'smtp.gmail.com:587'
     smtp_from: 'your-email@gmail.com'
     smtp_auth_username: 'your-email@gmail.com'
     smtp_auth_password: 'your-app-password'
     ```
   - For Gmail, create an App Password: https://myaccount.google.com/apppasswords

3. **Restart Alertmanager**:
   ```bash
   docker-compose restart alertmanager
   ```

## Security Tools Configuration

### Configure Security Scanning in Jenkins

All security tools are configured in the Jenkinsfile, but you may need to:

1. **Install OWASP Dependency Check Plugin**:
   - Manage Jenkins → Manage Plugins → Available
   - Search for "OWASP Dependency-Check"
   - Install and restart

2. **Configure OWASP Dependency Check**:
   - Manage Jenkins → Global Tool Configuration
   - Add OWASP Dependency-Check installation
   - Name: `OWASP-DC`
   - Install automatically from GitHub

3. **Configure SonarQube Scanner**:
   - Manage Jenkins → Global Tool Configuration
   - Add SonarQube Scanner
   - Name: `SonarQubeScanner`
   - Install automatically

### Running Security Scans Locally

```bash
# OWASP Dependency Check
docker run --rm -v $(pwd):/src owasp/dependency-check \
  --scan /src \
  --format HTML \
  --out /src/dependency-check-report.html

# Trivy Container Scan
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy:latest image vulnerable-app:latest

# Semgrep
docker run --rm -v $(pwd):/src returntocorp/semgrep semgrep \
  --config=auto /src

# Trufflehog Secret Scan
docker run --rm -v $(pwd):/pwd trufflesecurity/trufflehog:latest \
  filesystem /pwd
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**:
   ```bash
   # Find process using port
   netstat -ano | findstr :3000  # Windows
   lsof -i :3000                 # Linux/Mac
   
   # Kill process
   taskkill /PID <PID> /F        # Windows
   kill -9 <PID>                 # Linux/Mac
   ```

2. **Docker Permission Denied**:
   ```bash
   # Add user to docker group
   sudo usermod -aG docker $USER
   
   # Logout and login again
   ```

3. **Terraform State Lock**:
   ```bash
   # Force unlock (use with caution)
   terraform force-unlock <LOCK_ID>
   ```

4. **AWS Credentials Error**:
   ```bash
   # Verify credentials
   aws sts get-caller-identity
   
   # Reconfigure
   aws configure
   ```

5. **Jenkins Can't Access Docker**:
   ```bash
   # Add jenkins user to docker group
   sudo usermod -aG docker jenkins
   sudo systemctl restart jenkins
   ```

## Next Steps

After completing the setup:

1. ✅ Run the Jenkins pipeline
2. ✅ Review security scan reports
3. ✅ Configure Grafana dashboards
4. ✅ Test alerting
5. ✅ Document findings
6. ✅ Update resume with project details

## Support

If you encounter issues:
- Check the troubleshooting section
- Review logs: `docker-compose logs -f`
- Check AWS CloudWatch logs
- Review Jenkins console output
