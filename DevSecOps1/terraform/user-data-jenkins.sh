#!/bin/bash
set -e

# Update system
yum update -y

# Install Java (required for Jenkins)
yum install -y java-11-amazon-corretto

# Install Jenkins
wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo
rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key
yum install -y jenkins

# Install Docker
yum install -y docker
systemctl start docker
systemctl enable docker
usermod -aG docker jenkins
usermod -aG docker ec2-user

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install Git
yum install -y git

# Install Node.js and npm
curl -sL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

# Install Terraform
yum install -y yum-utils
yum-config-manager --add-repo https://rpm.releases.hashicorp.com/AmazonLinux/hashicorp.repo
yum install -y terraform

# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
./aws/install
rm -rf aws awscliv2.zip

# Start Jenkins
systemctl start jenkins
systemctl enable jenkins

# Wait for Jenkins to start
sleep 30

# Get initial admin password
JENKINS_PASSWORD=$(cat /var/lib/jenkins/secrets/initialAdminPassword)

# Create Jenkins configuration script
cat > /tmp/jenkins-setup.sh <<'EOF'
#!/bin/bash

# Install Jenkins plugins
java -jar /var/cache/jenkins/war/WEB-INF/jenkins-cli.jar -s http://localhost:8080/ -auth admin:$JENKINS_PASSWORD install-plugin \
  git \
  docker-workflow \
  pipeline-stage-view \
  sonar \
  dependency-check-jenkins-plugin \
  owasp-dependency-check \
  warnings-ng \
  junit \
  ssh-agent \
  credentials-binding \
  aws-credentials

# Restart Jenkins
systemctl restart jenkins
EOF

chmod +x /tmp/jenkins-setup.sh

# Create info file
cat > /home/ec2-user/jenkins-info.txt <<EOF
Jenkins Installation Complete!

Jenkins URL: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):8080

Initial Admin Password: $JENKINS_PASSWORD

Next Steps:
1. Access Jenkins at the URL above
2. Use the initial admin password to unlock Jenkins
3. Install suggested plugins
4. Create your first admin user
5. Configure Jenkins credentials for:
   - Docker Hub
   - AWS
   - GitHub
   - SSH keys for EC2

Installed Tools:
- Jenkins
- Docker & Docker Compose
- Git
- Node.js & npm
- Terraform
- AWS CLI
EOF

chown ec2-user:ec2-user /home/ec2-user/jenkins-info.txt

echo "Jenkins installation completed!"
