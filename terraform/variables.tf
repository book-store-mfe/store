variable "project_id" {}

variable "region" { }

variable "environment" {
  description = "Deployment environment (e.g., dev, staging, prod)"
  default     = "dev"
}

variable "base_name" {
  description = "Base name for all resources"
}
