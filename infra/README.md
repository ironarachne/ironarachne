# infra

OpenTofu configuration for Iron Arachne's hosting: three static sites on Scaleway Object Storage,
each fronted by a Bunny pull zone that terminates TLS for its own subdomain.

Use **OpenTofu** (`tofu`), not Terraform. `>= 1.10` is required — the state backend relies on
`use_lockfile`, and Scaleway has no DynamoDB to lock against.

| Stack                  | Serves                    | Bucket                    | Pull zone             |
| ---------------------- | ------------------------- | ------------------------- | --------------------- |
| `environments/dev`     | `dev.ironarachne.com`     | `ironarachne-web-dev`     | `ironarachne-dev`     |
| `environments/staging` | `staging.ironarachne.com` | `ironarachne-web-staging` | `ironarachne-staging` |
| `environments/prod`    | `app.ironarachne.com`     | `ironarachne-web-prod`    | `ironarachne-prod`    |
| `shared`               | the CD identity           | —                         | —                     |

`modules/static_site` holds the per-environment resources; each environment stack is a thin call to
it with its own backend key. The design and the reasoning behind it are in `docs/infrastructure.md`.

## Credentials

Four environment variables, none of which belong in a file:

```bash
export SCW_ACCESS_KEY=…          # Scaleway API key, used by the provider
export SCW_SECRET_KEY=…
export BUNNYNET_API_KEY=…        # bunny.net API key

# The S3 state backend speaks AWS's dialect and reads AWS's variable names,
# so the same Scaleway key has to be exported twice.
export AWS_ACCESS_KEY_ID="$SCW_ACCESS_KEY"
export AWS_SECRET_ACCESS_KEY="$SCW_SECRET_KEY"
```

Two identifiers are also required. They are not secrets, but they are account-specific, so they are
variables rather than committed values:

```bash
export TF_VAR_scaleway_organization_id=…
export TF_VAR_scaleway_project_id=…
```

Read them off the API key itself if you don't have them to hand:

```bash
project=$(curl -s -H "X-Auth-Token: $SCW_SECRET_KEY" \
  "https://api.scaleway.com/iam/v1alpha1/api-keys/$SCW_ACCESS_KEY" | jq -r .default_project_id)

curl -s -H "X-Auth-Token: $SCW_SECRET_KEY" \
  "https://api.scaleway.com/account/v3/projects/$project" | jq '{id, name, organization_id}'
```

## Running it

Each stack is a separate root module with its own state. Work inside one directory:

```bash
cd infra/environments/dev
tofu init
tofu plan
tofu apply
```

Apply `shared` once, in any order relative to the environments — nothing depends on it at plan time.

To read a plan without touching the state bucket's lock at all, add `-lock=false`. Safe for a
read-only look; never use it for an apply.

## The state bucket

State lives in `ironarachne-tfstate-poland` (`pl-waw`), one key per stack. That bucket is
deliberately **not** managed here: it holds the state that would manage it. Create it by hand if it
ever needs recreating.

Backend blocks cannot interpolate, so their settings are literal and repeated per stack. The four
`skip_*` flags are what let the S3 backend talk to Scaleway, which implements no STS, no IAM API and
none of the newer checksum headers.

## Minting the CD API key

Deliberately not Terraform's job: a key created by Terraform has its secret written to state.
`shared` creates the IAM application and a policy scoped to object-storage access on this project
only — read the bucket, and read, write and delete objects. Not `ObjectStorageFullAccess`, which
would let a leaked deploy key delete the buckets and rewrite their access policies.

Mint the key against that application by hand, and store it wherever CD reads secrets from:

```bash
cd infra/shared
app_id=$(tofu output -raw deployer_application_id)

scw iam api-key create application-id="$app_id" \
  description="CD: publish built site to environment buckets"
```

The secret is shown once. Nothing in this repository will ever hold it.

## First apply, and the one step that may need a retry

Bunny will not issue the managed TLS certificate for `dev.ironarachne.com` until that name already
resolves to the pull zone, so the module orders the DNS record ahead of the hostname. Bunny is
authoritative for `ironarachne.com`, so the gap is normally seconds — but on a cold create this is
the step most likely to fail. If it does, re-run `tofu apply`; the record will be in place and the
hostname will settle.

## What this does not do

**Deployments.** Nothing here uploads objects. Publishing a build is CD's job, and the outputs it
needs are exposed for that purpose:

```bash
tofu output bucket_name              # upload target
tofu output bucket_website_endpoint  # origin, for checking the bucket without the CDN
tofu output pull_zone_id             # cache purges after a publish
```

One thing for whoever writes that step: the pull zone honours the origin's `Cache-Control`, and
Object Storage sends none of its own. Set those headers on upload — long-lived for the
content-hashed `_app/immutable/` assets, short for the HTML shells — or caching stays at Bunny's
default regardless of what is configured here.

**The existing DNS.** `ironarachne.com` carries many records predating this code. The zone is read
through a data source and never managed; only the three new subdomains are declared here.
