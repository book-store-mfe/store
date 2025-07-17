provider "google" {
  project = var.project_id
  region  = var.region
}

resource "google_compute_global_address" "ip" {
  name = "${var.bucket_name}-ip"
}

resource "google_storage_bucket" "static" {
  name                        = var.bucket_name
  location                    = var.region
  force_destroy               = true
  uniform_bucket_level_access = true
  website {
    main_page_suffix = "index.html"
    not_found_page   = "index.html"
  }
}

resource "google_compute_backend_bucket" "backend" {
  name        = "${var.bucket_name}-backend"
  bucket_name = google_storage_bucket.static.name
  enable_cdn  = true
}

resource "google_compute_url_map" "url_map" {
  name                    = "${var.bucket_name}-url-map"
  default_backend_bucket = google_compute_backend_bucket.backend.name
}

resource "google_compute_target_http_proxy" "http_proxy" {
  name   = "${var.bucket_name}-http-proxy"
  url_map = google_compute_url_map.url_map.self_link
}

resource "google_compute_global_forwarding_rule" "http" {
  name        = "${var.bucket_name}-http-forwarding-rule"
  target      = google_compute_target_http_proxy.http_proxy.self_link
  port_range  = "80"
  ip_address  = google_compute_global_address.ip.address
  ip_protocol = "TCP"
}
