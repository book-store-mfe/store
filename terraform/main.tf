
provider "google" {
  project = var.project_id
  region  = var.region
}

locals {
  resource_prefix = "${var.base_name}-${var.environment}"
}

resource "google_compute_global_address" "ip" {
  name = "${local.resource_prefix}-ip"
}

resource "google_storage_bucket" "static" {
  name                        = local.resource_prefix
  location                    = var.region
  force_destroy               = true
  uniform_bucket_level_access = true
  website {
    main_page_suffix = "index.html"
    not_found_page   = "index.html"
  }
}

resource "google_storage_bucket_iam_binding" "public_access" {
  bucket = google_storage_bucket.static.name
  role   = "roles/storage.objectViewer"
  members = [
    "allUsers"
  ]
}

resource "google_compute_backend_bucket" "backend" {
  name        = "${local.resource_prefix}-backend"
  bucket_name = google_storage_bucket.static.name
  enable_cdn  = true
}

resource "google_compute_url_map" "url_map" {
  name            = "${local.resource_prefix}-url-map"
  default_service = google_compute_backend_bucket.backend.id
}

resource "google_compute_target_http_proxy" "http_proxy" {
  name    = "${local.resource_prefix}-http-proxy"
  url_map = google_compute_url_map.url_map.id
}

resource "google_compute_global_forwarding_rule" "http" {
  name        = "${local.resource_prefix}-http-forwarding-rule"
  target      = google_compute_target_http_proxy.http_proxy.id
  port_range  = "80"
  ip_address  = google_compute_global_address.ip.address
  ip_protocol = "TCP"
}
