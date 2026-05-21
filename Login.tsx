import { useState } from "react";
import { login } from "./src/api/auth";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const result = await login(email, password);

            if (result.user.role === "professor") {
                window.location.href = "/professor";
            } else {
                window.location.href = "/";
            } // o dashboard
        } catch (err: any) {
            setError("Credenciales inválidas o error en el servidor");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-neutral-50 to-neutral-100 px-4">
            <form
                onSubmit={handleSubmit}
                className="card p-8 w-full max-w-md space-y-6"
            >
                <div className="space-y-2">
                    <p className="text-sm font-semibold text-blue-600 uppercase tracking-[0.24em]">
                        Bienvenido de nuevo
                    </p>
                    <h1 className="text-3xl font-bold text-neutral-900">Iniciar sesión</h1>
                    <p className="text-sm text-neutral-600">
                        Accede a tu panel y continúa con tu Project Charter.
                    </p>
                </div>

                <div className="space-y-4">
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
                </div>

                {error && <p className="text-red-600 text-sm">{error}</p>}

                <button
                    disabled={loading}
                    className="btn-primary w-full"
                >
                    {loading ? "Ingresando..." : "Entrar"}
                </button>
            </form>
        </div>
    );
}