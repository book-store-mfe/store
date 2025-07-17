output "frontend_ip" {
  value = google_compute_global_address.ip.address
  description = "IP público para acessar o site via HTTP"
}
