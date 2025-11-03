output "app_public_ip" {
  description = "Public IP of the application server"
  value       = aws_eip.app.public_ip
}

output "jenkins_public_ip" {
  description = "Public IP of the Jenkins server"
  value       = aws_eip.jenkins.public_ip
}

output "app_url" {
  description = "URL to access the application"
  value       = "http://${aws_eip.app.public_ip}:3000"
}

output "jenkins_url" {
  description = "URL to access Jenkins"
  value       = "http://${aws_eip.jenkins.public_ip}:8080"
}

output "prometheus_url" {
  description = "URL to access Prometheus"
  value       = "http://${aws_eip.app.public_ip}:9090"
}

output "grafana_url" {
  description = "URL to access Grafana"
  value       = "http://${aws_eip.app.public_ip}:3001"
}

output "ssh_command_app" {
  description = "SSH command to connect to app server"
  value       = "ssh -i ~/.ssh/${var.project_name}-key.pem ec2-user@${aws_eip.app.public_ip}"
}

output "ssh_command_jenkins" {
  description = "SSH command to connect to Jenkins server"
  value       = "ssh -i ~/.ssh/${var.project_name}-key.pem ec2-user@${aws_eip.jenkins.public_ip}"
}
