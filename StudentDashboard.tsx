import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { me } from "./src/api/auth";
import NavBar from "./NavBar";

interface Charter {
    id: string;
    project_name: string;
    version: string;
    submitted_at: string | null;
    grade: number | null;
    status: string;
}

export default function StudentDashboard() {
    const [charters, setCharters] = useState<Charter[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userName, setUserName] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const loadUserAndCharters = async () => {
            try {
                const user = await me();
                setUserName(user.name);

                const token = localStorage.getItem("token");
                const response = await fetch("/api/charters", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Error al cargar los charters");
                }

                const json = await response.json();
                // API may return either an array or an object with a `data` array
                const items = Array.isArray(json) ? json : Array.isArray(json?.data) ? json.data : [];
                setCharters(items);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Error desconocido");
                localStorage.removeItem("token");
                navigate("/login");
            } finally {
                setLoading(false);
            }
        };

        loadUserAndCharters();
    }, [navigate]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "submitted":
                return "bg-blue-100 text-blue-700";
            case "graded":
                return "bg-emerald-100 text-emerald-700";
            case "draft":
                return "bg-amber-100 text-amber-700";
            default:
                return "bg-neutral-100 text-neutral-700";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "submitted":
                return "Enviado";
            case "graded":
                return "Calificado";
            case "draft":
                return "Borrador";
            default:
                return status;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-neutral-50 to-neutral-100">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl -z-10" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl -z-10" />
            </div>

            <NavBar userName={userName} userRole="student" />

            <div className="container-responsive py-8">
                <div className="flex flex-col gap-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900">
                                Mis Project Charters
                            </h1>
                            <p className="text-neutral-600 mt-2">
                                Gestiona y visualiza todos tus project charters
                            </p>
                        </div>
                        <button
                            onClick={() => navigate("/create")}
                            className="btn-primary inline-flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Crear nuevo
                        </button>
                    </div>

                    {/* Content */}
                    {loading ? (
                        <div className="card p-12 flex items-center justify-center">
                            <div className="flex flex-col items-center gap-3">
                                <svg className="w-8 h-8 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                <p className="text-neutral-600">Cargando charters...</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="notification-error">
                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <div>
                                    <h3 className="font-semibold">Error al cargar</h3>
                                    <p className="text-sm mt-1">{error}</p>
                                </div>
                            </div>
                        </div>
                    ) : charters.length === 0 ? (
                        <div className="card p-12 text-center">
                            <svg className="w-16 h-16 mx-auto text-neutral-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="text-xl font-semibold text-neutral-900 mb-2">No hay charters aún</h3>
                            <p className="text-neutral-600 mb-6">
                                Crea tu primer project charter para comenzar
                            </p>
                            <button
                                onClick={() => navigate("/create")}
                                className="btn-primary inline-flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Crear primer charter
                            </button>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {charters.map((charter) => (
                                <div
                                    key={charter.id}
                                    onClick={() => navigate(`/charters/${charter.id}`)}
                                    className="card p-6 hover:shadow-lg hover:scale-[1.01] transition-all cursor-pointer group"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-blue-600 transition-colors">
                                                    {charter.project_name || "Sin nombre"}
                                                </h3>
                                                <span className="text-sm text-neutral-500">
                                                    v{charter.version || "1.0"}
                                                </span>
                                            </div>
                                            <p className="text-sm text-neutral-600 mt-2">
                                                {charter.submitted_at
                                                    ? `Enviado: ${new Date(charter.submitted_at).toLocaleDateString("es-CO")}`
                                                    : "No enviado"}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(charter.status)}`}>
                                                    {getStatusLabel(charter.status)}
                                                </span>
                                                {charter.grade != null && Number.isFinite(Number(charter.grade)) && (
                                                    <p className="text-sm font-semibold text-neutral-900 mt-2">
                                                        Calificación: {Number(charter.grade).toFixed(1)}/5
                                                    </p>
                                                )}
                                            </div>
                                            <svg className="w-5 h-5 text-neutral-400 group-hover:text-blue-600 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
