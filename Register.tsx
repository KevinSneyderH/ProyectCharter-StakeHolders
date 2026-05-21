import { useState } from "react";

export default function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState<"student" | "professor">("student");

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    password_confirmation: confirmPassword,
                    role,
                }),
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.message || "Error al registrar usuario");
            }

            // 👇 igual que login: redirección por rol
            if (result.user?.role === "professor") {
                window.location.href = "/professor";
            } else {
                window.location.href = "/";
            }

        } catch (err: any) {
            setError(err.message || "Error en el servidor");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-neutral-50 to-neutral-100 px-4">

            <div className="w-full max-w-md">

                <form
                    onSubmit={handleSubmit}
                    className="card p-8 space-y-6"
                >
                    <div className="space-y-2">
                        <p className="text-sm font-semibold text-blue-600 uppercase tracking-[0.24em]">
                            Crear cuenta
                        </p>
                        <h1 className="text-3xl font-bold text-neutral-900">
                            Registro
                        </h1>
                        <p className="text-sm text-neutral-600">
                            Crea tu cuenta para usar Project Charter.
                        </p>
                    </div>

                    <div className="space-y-4">

                        <input
                            type="text"
                            placeholder="Nombre"
                            className="input-field"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />

                        <input
                            type="email"
                            placeholder="Email"
                            className="input-field"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            className="input-field"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <input
                            type="password"
                            placeholder="Confirm password"
                            className="input-field"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />

                        <select
                            className="input-field"
                            value={role}
                            onChange={(e) =>
                                setRole(e.target.value as "student")
                            }
                        >
                            <option value="student">Student</option>
                        </select>

                    </div>

                    {error && (
                        <p className="text-red-600 text-sm">{error}</p>
                    )}

                    <button
                        disabled={loading}
                        className="btn-primary w-full"
                    >
                        {loading ? "Creando cuenta..." : "Registrarse"}
                    </button>
                </form>

                {/* 👇 igual que login */}
                <p className="text-sm text-center mt-4 text-neutral-600">
                    ¿Ya tienes cuenta?{" "}
                    <a
                        href="/login"
                        className="text-blue-600 font-medium hover:underline"
                    >
                        Inicia sesión
                    </a>
                </p>

            </div>
        </div>
    );
}