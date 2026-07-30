terraform {
  required_version = ">= 1.10"

  required_providers {
    scaleway = {
      source  = "scaleway/scaleway"
      version = "~> 2.79"
    }
  }

  /**
   * The state bucket is deliberately not managed by this code — it holds the
   * state that would manage it. It already exists in pl-waw.
   *
   * Backend blocks cannot interpolate, so the values here are literal and
   * duplicated across stacks by necessity. The `skip_*` flags are what let the
   * S3 backend talk to Scaleway, which implements no STS, no IAM API and none
   * of the newer checksum headers.
   */
  backend "s3" {
    bucket = "ironarachne-tfstate-poland"
    key    = "shared/terraform.tfstate"
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
