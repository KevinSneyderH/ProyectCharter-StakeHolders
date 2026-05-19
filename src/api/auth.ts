import { api } from "../lib/axios";

export async function getCsrf() {
    await api.get("/sanctum/csrf-cookie");
}

export async function login(email: string, password: string) {
    await getCsrf();

    return api.post("/login", {
        email,
        password,
    });
}

export async function logout() {
    return api.post("/logout");
}

export async function me() {
    return api.get("/api/me");
}