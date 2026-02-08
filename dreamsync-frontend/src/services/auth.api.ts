import { apiFetch } from "../lib/apiClient";

export async function loginApi(email: string, password: string) {
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function registerApi(
  email: string,
  _name: string,
  password: string
) {
  return apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}
