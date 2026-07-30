output "deployer_application_id" {
  description = "IAM application to mint the CD API key against. See infra/README.md for the command."
  value       = scaleway_iam_application.deployer.id
}

output "deployer_policy_id" {
  description = "Policy granting that application object-storage access."
  value       = scaleway_iam_policy.deployer_object_storage.id
}
