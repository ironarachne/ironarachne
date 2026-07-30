variable "scaleway_organization_id" {
  description = "Scaleway organization the IAM application belongs to. Supply via TF_VAR_scaleway_organization_id; see infra/README.md."
  type        = string
}

variable "scaleway_project_id" {
  description = "Scaleway project holding the site buckets. The deploy policy is scoped to this project alone."
  type        = string
}

variable "region" {
  description = "Default Scaleway region for this stack."
  type        = string
  default     = "pl-waw"
}
