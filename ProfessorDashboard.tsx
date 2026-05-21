import { useEffect, useState } from "react";
import NavBar from "./NavBar";
import { me } from "./src/api/auth";
import { useNavigate } from "react-router-dom";

export default function ProfessorDashboard() {
    const [charters, setCharters] = useState<any[]>([]);
    const [userName, setUserName] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "ungraded" | "graded">("all");
    const [studentFilter, setStudentFilter] = useState<string>("");
    const navigate = useNavigate();

    useEffect(() => {
        loadCharters();
    }, []);
    useEffect(() => {
        const loadUser = async () => {
            try {
                const user = await me();
                setUserName(user.name);
            } catch (error) {
                localStorage.removeItem("token");
            }
        };

        loadUser();
    }, []);

    async function loadCharters() {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch("/api/charters", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });

            const data = await response.json();

            console.log("API RESPONSE:", data);

            setCharters(data.data ?? []);
        } catch (error) {
            console.error("Error cargando charters:", error);
            setCharters([]);
        }
    }
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-neutral-50 to-neutral-100">
            <NavBar userName={userName} userRole="professor" />

            <main className="container-responsive py-10">
                <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-blue-600 uppercase tracking-[0.22em] mb-2">
                            Panel del Profesor
                        </p>
                        <h1 className="text-4xl font-bold text-neutral-900">
                            Charters en revisión
                        </h1>
                        <p className="text-sm text-neutral-600 mt-2 max-w-2xl">
                            Revisa los formularios entregados, visualiza detalles y califica los proyectos de tus estudiantes.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 items-center w-full">
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <label className="text-sm text-neutral-600">Filtrar:</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as any)}
                                className="input-field w-full sm:w-auto"
                            >
                                <option value="all">Todos</option>
                                <option value="ungraded">Sin calificar</option>
                                <option value="graded">Calificados</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-64">
                            <label className="text-sm text-neutral-600">Estudiante:</label>
                            <input
                                type="search"
                                value={studentFilter}
                                onChange={(e) => setStudentFilter(e.target.value)}
                                placeholder="Buscar por nombre"
                                className="input-field w-full"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid gap-4">
                    {charters
                        .filter((charter) => {
                            // status filter
                            if (statusFilter === "ungraded") {
                                const score = charter.grade?.score ?? charter.grade ?? null;
                                if (score !== null && score !== undefined) return false;
                            }
                            if (statusFilter === "graded") {
                                const score = charter.grade?.score ?? charter.grade ?? null;
                                if (score === null || score === undefined) return false;
                            }

                            // student filter (search by name substring)
                            if (studentFilter && studentFilter.trim() !== "") {
                                const name = String(charter.student?.name ?? "").toLowerCase();
                                return name.includes(studentFilter.trim().toLowerCase());
                            }

                            return true;
                        })
                        .map((charter) => (
                            <div
                                key={charter.id}
                                className="card p-5 flex flex-col justify-between min-h-[160px]"
                            >
                                <div>
                                    <h2 className="text-xl font-semibold text-neutral-900 line-clamp-1">
                                        {charter.project_name}
                                    </h2>

                                    <p className="text-sm text-neutral-500 mt-1">
                                        {charter.student?.name}
                                    </p>

                                    <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700">
                                        {charter.grade?.score !== null && charter.grade?.score !== undefined ? (
                                            <span className="text-emerald-700">Nota: {charter.grade.score}/5</span>
                                        ) : (
                                            <span className="text-neutral-600">Sin calificar</span>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate(`/charters/${charter.id}`)}
                                    className="btn-secondary mt-5 self-start"
                                >
                                    Ver detalle
                                </button>
                            </div>
                        ))}
                </div>
            </main>
        </div>
    );
}