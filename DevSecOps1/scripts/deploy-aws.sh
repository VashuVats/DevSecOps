#!/bin/bash

# DevSecOps Project - AWS Deployment Script
# This script deploys the infrastructure to AWS using Terraform

set -e

echo "☁️  DevSecOps Project - AWS Deployment"
echo "======================================"
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

command -v aws >/dev/null 2>&1 || { echo "❌ AWS CLI is not installed"; exit 1; }
command -v terraform >/dev/null 2>&1 || { echo "❌ Terraform is not installed"; exit 1; }

# Check AWS credentials
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "❌ AWS credentials not configured. Run: aws configure"
    exit 1
fi

echo "✅ All prerequisites met"
echo ""

# Check if terraform.tfvars exists
if [ ! -f "terraform/terraform.tfvars" ]; then
    echo "❌ terraform/terraform.tfvars not found"
    echo "Please create terraform/terraform.tfvars with required variables"
    echo "See docs/SETUP.md for details"
    exit 1
fi

echo "📁 Found terraform.tfvars"
echo ""

# Navigate to terraform directory
cd terraform

# Initialize Terraform
echo "🔧 Initializing Terraform..."
terraform init
echo "✅ Terraform initialized"
echo ""

# Validate configuration
echo "✅ Validating Terraform configuration..."
terraform validate
echo "✅ Configuration is valid"
echo ""

# Format files
echo "📝 Formatting Terraform files..."
terraform fmt
echo "✅ Files formatted"
echo ""

# Plan deployment
echo "📊 Planning deployment..."
terraform plan -out=tfplan
echo ""

# Ask for confirmation
read -p "Do you want to apply this plan? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "❌ Deployment cancelled"
    exit 0
fi

# Apply configuration
echo ""
echo "🚀 Deploying infrastructure..."
terraform apply tfplan
echo "✅ Infrastructure deployed"
echo ""

# Save outputs
echo "💾 Saving outputs..."
terraform output > ../deployment-info.txt
terraform output -raw app_public_ip > ../app_ip.txt
terraform output -raw jenkins_public_ip > ../jenkins_ip.txt

APP_IP=$(terraform output -raw app_public_ip)
JENKINS_IP=$(terraform output -raw jenkins_public_ip)

echo "✅ Outputs saved"
echo ""

echo "🎉 Deployment complete!"
echo ""
echo "📍 Your infrastructure:"
echo "   Application:  http://${APP_IP}:3000"
echo "   Jenkins:      http://${JENKINS_IP}:8080"
echo "   Prometheus:   http://${APP_IP}:9090"
echo "   Grafana:      http://${APP_IP}:3001"
echo ""
echo "🔑 SSH Commands:"
echo "   App Server:     ssh -i ~/.ssh/devsecops-key ec2-user@${APP_IP}"
echo "   Jenkins Server: ssh -i ~/.ssh/devsecops-key ec2-user@${JENKINS_IP}"
echo ""
echo "📝 Next steps:"
echo "   1. Configure Jenkins at http://${JENKINS_IP}:8080"
echo "   2. Set up Grafana dashboards at http://${APP_IP}:3001"
echo "   3. Test the application at http://${APP_IP}:3000"
echo ""
