variable "scaleway_organization_id" {
  description = "Scaleway organization. Supply via TF_VAR_scaleway_organization_id; see infra/README.md."
  type        = string
}

variable "scaleway_project_id" {
  description = "Scaleway project holding this environment's bucket."
  type        = string
}

variable "region" {
  description = "Scaleway region hosting the bucket."
  type        = string
  default     = "pl-waw"
}
