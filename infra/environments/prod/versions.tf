terraform {
  required_version = ">= 1.10"

  required_providers {
    scaleway = {
      source  = "scaleway/scaleway"
      version = "~> 2.79"
    }
    bunnynet = {
      source  = "BunnyWay/bunnynet"
      version = "~> 0.16.0"
    }
  }

  backend "s3" {
    bucket = "ironarachne-tfstate-poland"
    key    = "environments/prod/terraform.tfstate"
    region = "pl-waw"

    endpoints = {
      s3 = "https://s3.pl-waw.scw.cloud"
    }

    skip_credentials_validation = true
    skip_region_validation      = true
    skip_requesting_account_id  = true
    skip_s3_checksum            = true

    use_lockfile = true
  }
}
