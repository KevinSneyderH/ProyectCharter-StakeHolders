import axios from "axios";

const api = axios.create({
    baseURL: "/api",
});

export async function login(email: string, password: string) {
    const response = await api.post("/auth/login", {
        email,
        password,
    });

    localStorage.setItem("token", response.data.token);

    return response.data;
}

export async function me() {
    const token = localStorage.getItem("token");

    const response = await api.get("/auth/me", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return response.data.user;
}

export async function logout() {
    const token = localStorage.getItem("token");

    await api.post(
        "/auth/logout",
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    localStorage.removeItem("token");
}