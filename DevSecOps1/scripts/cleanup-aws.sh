#!/bin/bash

# DevSecOps Project - AWS Cleanup Script
# This script destroys all AWS resources created by Terraform

set -e

echo "🗑️  DevSecOps Project - AWS Cleanup"
echo "===================================="
echo ""

# Warning
echo "⚠️  WARNING: This will destroy all AWS resources!"
echo "This includes:"
echo "  - EC2 instances"
echo "  - VPC and networking"
echo "  - Security groups"
echo "  - Elastic IPs"
echo "  - CloudWatch logs"
echo ""

read -p "Are you sure you want to continue? (type 'yes' to confirm): " confirm
if [ "$confirm" != "yes" ]; then
    echo "❌ Cleanup cancelled"
    exit 0
fi

echo ""
read -p "Type 'DELETE' to confirm destruction: " confirm2
if [ "$confirm2" != "DELETE" ]; then
    echo "❌ Cleanup cancelled"
    exit 0
fi

echo ""
echo "🚀 Starting cleanup..."

# Navigate to terraform directory
cd terraform

# Destroy infrastructure
terraform destroy -auto-approve

echo ""
echo "✅ All AWS resources destroyed"
echo ""
echo "💡 Remember to:"
echo "   - Check AWS console for any remaining resources"
echo "   - Delete S3 bucket if you created one for Terraform state"
echo "   - Remove local deployment files (app_ip.txt, jenkins_ip.txt)"
echo ""
