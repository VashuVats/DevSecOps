# ⚡ Quick Start Guide

Get the DevSecOps project running in under 30 minutes!

## Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Git
- AWS Account (for cloud deployment)

## Local Development (5 minutes)

```bash
# Clone and setup
git clone <your-repo>
cd DevSecOps
npm install

# Run application
npm start
# Access: http://localhost:3000
```

## Docker Setup (5 minutes)

```bash
# Build and run
docker build -t vulnerable-app .
docker run -p 3000:3000 vulnerable-app

# Or use docker-compose for full stack
docker-compose up -d

# Access services:
# - App: http://localhost:3000
# - Prometheus: http://localhost:9090
# - Grafana: http://localhost:3001 (admin/admin123)
```

## AWS Deployment (15 minutes)

```bash
# 1. Configure AWS
aws configure

# 2. Generate SSH key
ssh-keygen -t rsa -b 4096 -f ~/.ssh/devsecops-key

# 3. Create terraform/terraform.tfvars (see SETUP.md)

# 4. Deploy
cd terraform
terraform init
terraform apply

# 5. Access
# Get IPs from: terraform output
```

## Next Steps

- Configure Jenkins pipeline
- Import Grafana dashboards
- Run security scans
- Test vulnerabilities

See full documentation in README.md and SETUP.md
