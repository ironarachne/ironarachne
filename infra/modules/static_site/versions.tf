terraform {
  # 1.10 is the floor for `use_lockfile`, the S3-native state locking the
  # environment stacks rely on. Scaleway has no DynamoDB to lock against.
  required_version = ">= 1.10"

  required_providers {
    scaleway = {
      source  = "scaleway/scaleway"
      version = "~> 2.79"
    }
    bunnynet = {
      # Pinned to the patch series: this provider is pre-1.0, so a minor bump
      # may move the schema.
      source  = "BunnyWay/bunnynet"
      version = "~> 0.16.0"
    }
  }
}
