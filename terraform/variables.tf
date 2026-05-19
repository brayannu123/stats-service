variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "stats-service"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "shorten_project_name" {
  description = "Name of the shorten-service project to reference its resources"
  type        = string
  default     = "url-shortener-shorten-urls"
}
