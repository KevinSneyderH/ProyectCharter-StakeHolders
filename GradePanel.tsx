import { useEffect, useState } from "react";
import { me } from "./src/api/auth";

type Props = {
    charterId: number;
};

type Grade = {
    score: number;
    general_feedback: string;
} | null;

export default function GradePanel({ charterId }: Props) {
    const [grade, setGrade] = useState<Grade>(null);
    const [editing, setEditing] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);

    const [score, setScore] = useState<string>("");
    const [feedback, setFeedback] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadGrade();
        loadUserRole();
    }, []);

    async function loadUserRole() {
        try {
            const user = await me();
            setUserRole(user.role ?? null);
        } catch (err) {
            setUserRole(null);
        }
    }

    async function loadGrade() {
        try {
            const token = localStorage.getItem("token");

            const res = await fetch(`/api/charters/${charterId}/grade`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });

            const data = await res.json();

            if (data?.data) {
                setGrade(data.data);
                setScore(String(data.data.score));
                setFeedback(data.data.general_feedback || "");
            }
        } catch (error) {
            console.error(error);
        }
    }

    async function submitGrade() {
        setLoading(true);

        try {
            const token = localStorage.getItem("token");

            await fetch(`/api/charters/${charterId}/grade`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    score: Number(score),
                    general_feedback: feedback,
                }),
            });

            await loadGrade();
            setEditing(false);
        } finally {
            setLoading(false);
        }
    }

    const canEdit = userRole === "professor";

    // ─── COLLAPSED VIEW ─────────────────────────────
    if (collapsed) {
        return (
            <div className="bg-white border rounded-xl p-4 shadow-sm flex items-center justify-between">

                <div>
                    <p className="text-sm text-gray-500">Calificación</p>
                    <p className="font-bold">
                        {grade ? `${grade.score} / 5` : "Sin nota"}
                    </p>
                </div>

                <button
                    onClick={() => setCollapsed(false)}
                    className="px-3 py-1 bg-gray-900 text-white rounded-lg text-sm"
                >
                    Abrir
                </button>
            </div>
        );
    }

    // ─── VIEW MODE ─────────────────────────────
    if (grade && !editing) {
        return (
            <div className="bg-white border rounded-xl p-6 shadow-sm space-y-3 transition-all">

                {/* HEADER */}
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">
                        Calificación del profesor
                    </h2>

                    <button
                        onClick={() => setCollapsed(true)}
                        className="text-sm text-gray-500 hover:text-black"
                    >
                        Contraer
                    </button>
                </div>

                <div className="text-3xl font-bold">
                    {grade.score} / 5
                </div>

                <p className="text-gray-600">
                    {grade.general_feedback}
                </p>

                <button
                    onClick={() => setEditing(true)}
                    className={`mt-3 px-4 py-2 ${canEdit ? "bg-gray-900 text-white" : "bg-neutral-100 text-neutral-500 cursor-not-allowed"} rounded-lg w-full`}
                    disabled={!canEdit}
                >
                    {canEdit ? "Editar calificación" : "Solo profesores pueden editar"}
                </button>
            </div>
        );
    }
    // ─── EDIT MODE ─────────────────────────────
    if (!canEdit) {
        // Non-professors see the empty grade panel prompting no access
        return (
            <div className="bg-white border rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold">Calificación</h2>
                <p className="text-neutral-600 mt-2">{grade ? `${grade.score} / 5` : "Sin nota"}</p>
                {!grade && <p className="text-sm text-neutral-500 mt-3">La calificación estará disponible cuando el profesor la asigne.</p>}
            </div>
        );
    }

    return (
        <div className="bg-white border rounded-xl p-6 space-y-4 shadow-sm transition-all">

            {/* HEADER */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                    {grade ? "Editar calificación" : "Calificar proyecto"}
                </h2>

                <button
                    onClick={() => setCollapsed(true)}
                    className="text-sm text-gray-500 hover:text-black"
                >
                    Contraer
                </button>
            </div>

            {/* NOTA */}
            <div>
                <label className="text-sm text-gray-600">
                    Nota (0 - 5)
                </label>

                <input
                    type="number"
                    min={0}
                    max={5}
                    step={0.1}
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    className="input-field mt-1"
                />
            </div>

            {/* FEEDBACK */}
            <div>
                <label className="text-sm text-gray-600">
                    Comentario del profesor
                </label>

                <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="input-field mt-1"
                    rows={4}
                />
            </div>

            {/* BOTONES */}
            <button
                onClick={submitGrade}
                disabled={loading}
                className="btn-primary w-full"
            >
                {loading
                    ? "Guardando..."
                    : grade
                        ? "Actualizar"
                        : "Guardar calificación"}
            </button>
        </div>
    );
}