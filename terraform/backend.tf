terraform {
  backend "gcs" {
    bucket = "terraform-state-frontend"
    prefix = "projects/${var.base_name}/${var.environment}/terraform.tfstate"
  }
}
