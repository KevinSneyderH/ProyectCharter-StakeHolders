import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GradePanel from "./GradePanel";
import NavBar from "./NavBar";
import { me } from "./src/api/auth";

const sections = [
    { id: "overview", label: "Resumen" },
    { id: "product", label: "Producto" },
    { id: "architecture", label: "Arquitectura" },
    { id: "phases", label: "Fases" },
    { id: "pm", label: "PM" },
    { id: "sponsor", label: "Sponsor" },
    { id: "requirements", label: "Requisitos" },
    { id: "objectives", label: "Objetivos" },
    { id: "milestones", label: "Hitos" },
    { id: "risks", label: "Riesgos" },
];

export default function CharterDetailGod() {
    const { id } = useParams();
    const [charter, setCharter] = useState<any>(null);
    const [userName, setUserName] = useState("");
    const [userRole, setUserRole] = useState<"student" | "professor">("student");
    const [active, setActive] = useState("overview");
    const [loading, setLoading] = useState(true);

    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const navigate = useNavigate();

    const observerRef = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const user = await me();
                setUserName(user.name);
                setUserRole(user.role === "professor" ? "professor" : "student");
            } catch (error) {
                localStorage.removeItem("token");
                navigate("/login");
            }
        };

        loadUser();
    }, [navigate]);

    useEffect(() => {
        load();
    }, [id]);

    async function load() {
        setLoading(true);

        const token = localStorage.getItem("token");

        try {
            const res = await fetch(`/api/charters/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });

            const data = await res.json();
            setCharter(data.data);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!charter) return;

        const options = {
            root: null,
            rootMargin: "-20% 0px -60% 0px",
            threshold: 0.1,
        };

        const callback: IntersectionObserverCallback = (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActive(entry.target.id);
                }
            });
        };

        const observer = new IntersectionObserver(callback, options);
        observerRef.current = observer;

        sections.forEach((s) => {
            const el = document.getElementById(s.id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [charter]);

    const goTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });

        setMobileOpen(false);
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-neutral-50 to-neutral-100">Cargando...</div>;
    if (!charter) return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-neutral-50 to-neutral-100">No encontrado</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-neutral-50 to-neutral-100">
            <NavBar userName={userName} userRole={userRole} />

            <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden fixed top-4 left-4 z-50 bg-blue-900 text-white px-3 py-2 rounded-lg shadow-lg"
            >
                ☰
            </button>

            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 md:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <aside
                className={`
                    fixed z-50 h-screen bg-white border-r border-neutral-200 px-4 py-6 shadow-sm
                    transition-all duration-300
                    ${collapsed ? "w-20" : "w-72"}
                    ${mobileOpen ? "left-0" : "-left-full md:left-0"}
                `}
            >
                <div className="flex items-center justify-between mb-6">
                    {!collapsed && (
                        <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-[0.24em]">
                            Documento
                        </h2>
                    )}

                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="text-xs px-2 py-1 rounded-lg bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition"
                    >
                        {collapsed ? "→" : "←"}
                    </button>
                </div>

                {sections.map((s) => (
                    <button
                        key={s.id}
                        onClick={() => goTo(s.id)}
                        className={`flex items-center gap-3 w-full text-left px-3 py-3 rounded-xl transition relative
                            ${active === s.id
                                ? "bg-blue-50 text-blue-900 font-semibold"
                                : "text-neutral-600 hover:bg-neutral-100"
                            }`}
                    >
                        <span
                            className={`w-2 h-2 rounded-full ${active === s.id ? "bg-blue-600" : "bg-neutral-300"}`}
                        />

                        {!collapsed && <span>{s.label}</span>}

                        {active === s.id && (
                            <span className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-blue-600" />
                        )}
                    </button>
                ))}
            </aside>

            <main
                className="flex-1 px-4 py-8 md:px-10 md:pl-80 space-y-12"
            >
                <div className="container-responsive">
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition"
                    >
                        ← Volver
                    </button>

                    <section id="overview" className="scroll-mt-24">
                        <div className="card p-8 space-y-4">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                    <h1 className="text-4xl font-bold text-neutral-900">
                                        {charter.project_name}
                                    </h1>
                                    <p className="text-neutral-600 mt-1">
                                        {charter.project_acronym}
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                    <Card label="Estado" value={charter.status} />
                                    <Card label="Estudiante" value={charter.student?.name} />
                                    <Card label="Duración" value={charter.duration} />
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="grid gap-6">
                        <section className="card p-6" id="general">
                            <h2 className="text-2xl font-semibold text-neutral-900 mb-3">Descripción general</h2>
                            <p className="text-neutral-700 leading-relaxed">{charter.general_description ?? charter.generalDescription ?? charter.generalDescription}</p>
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <p className="text-xs text-neutral-500">Ubicación</p>
                                    <p className="font-medium text-neutral-900">{charter.location}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-neutral-500">Duración</p>
                                    <p className="font-medium text-neutral-900">{charter.duration}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-neutral-500">Presupuesto</p>
                                    <p className="font-medium text-neutral-900">{charter.total_budget}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-neutral-500">Estado</p>
                                    <p className="inline-flex items-center px-2 py-1 rounded-full text-sm font-semibold bg-blue-50 text-blue-800">{charter.status}</p>
                                </div>
                            </div>
                        </section>

                        <section className="card p-6" id="product">
                            <h2 className="text-2xl font-semibold text-neutral-900 mb-3">Producto</h2>
                            <p className="text-neutral-700 leading-relaxed">{charter.product_definition ?? charter.productDefinition}</p>
                        </section>

                        <section className="card p-6" id="architecture">
                            <h2 className="text-2xl font-semibold text-neutral-900 mb-3">Arquitectura</h2>
                            <p className="text-neutral-700 leading-relaxed">{charter.solution_architecture ?? charter.solutionArchitecture}</p>
                        </section>

                        <section className="card p-6" id="phases">
                            <h2 className="text-2xl font-semibold text-neutral-900 mb-3">Fases</h2>
                            <pre className="whitespace-pre-wrap text-sm text-neutral-700">{charter.project_phases ?? charter.projectPhases}</pre>
                        </section>

                        <section className="card p-6" id="requirements">
                            <h2 className="text-2xl font-semibold text-neutral-900 mb-3">Requisitos</h2>
                            <div className="space-y-2 text-neutral-700">
                                <p><span className="font-semibold">Sponsor:</span> {charter.sponsor_requirements ?? charter.sponsorRequirements ?? charter.sponsor_requirements}</p>
                                <p><span className="font-semibold">Cliente:</span> {charter.client_requirements ?? charter.clientRequirements ?? charter.client_requirements}</p>
                                <p><span className="font-semibold">Funcionales:</span> {charter.functional_requirements ?? charter.functionalRequirements}</p>
                                <p><span className="font-semibold">No funcionales:</span> {charter.non_functional_requirements ?? charter.nonFunctionalRequirements}</p>
                                <p><span className="font-semibold">Calidad:</span> {charter.quality_requirements ?? charter.qualityRequirements}</p>
                            </div>
                        </section>

                        <section className="card p-6" id="versions">
                            <h2 className="text-2xl font-semibold text-neutral-900 mb-3">Control de versiones</h2>
                            <div className="space-y-3">
                                {(charter.versions ?? charter.versionsList ?? []).map((v: any) => (
                                    <div key={v.id} className="p-3 border rounded-xl bg-white">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold">{v.version}</p>
                                                <p className="text-xs text-neutral-500">{v.reason}</p>
                                            </div>
                                            <div className="text-sm text-neutral-600">{v.date}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="card p-6" id="objectives">
                            <h2 className="text-2xl font-semibold text-neutral-900 mb-3">Objetivos</h2>
                            <div className="space-y-3">
                                {(charter.objectives ?? []).map((o: any) => (
                                    <div key={o.id} className="rounded-xl border border-neutral-200 bg-white p-4">
                                        <p className="font-semibold text-neutral-900">{o.concept}</p>
                                        <p className="text-neutral-700">{o.objective}</p>
                                        <span className="text-xs text-neutral-500">{o.success_criteria}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="card p-6" id="organizations">
                            <h2 className="text-2xl font-semibold text-neutral-900 mb-3">Organizaciones / Grupos</h2>
                            <div className="space-y-3">
                                {(charter.organizations ?? charter.organizaciones ?? []).map((org: any) => (
                                    <div key={org.id} className="rounded-xl border border-neutral-200 bg-white p-3 text-neutral-700">
                                        <p className="font-semibold">{org.name_or_group ?? org.name}</p>
                                        <p className="text-sm text-neutral-600">{org.role}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="card p-6" id="milestones">
                            <h2 className="text-2xl font-semibold text-neutral-900 mb-3">Hitos</h2>
                            <div className="space-y-3">
                                {(charter.milestones ?? []).map((m: any) => (
                                    <div key={m.id} className="rounded-xl border border-neutral-200 bg-white p-3 text-neutral-700">
                                        <p className="font-semibold">{m.name}</p>
                                        <p className="text-sm text-neutral-600">{m.scheduled_date}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="card p-6" id="risks">
                            <h2 className="text-2xl font-semibold text-neutral-900 mb-3">Riesgos</h2>
                            <div className="space-y-3">
                                {(charter.risks ?? []).map((r: any) => (
                                    <div key={r.id} className="rounded-xl border border-neutral-200 bg-white p-3 text-neutral-700">
                                        <p className="font-semibold">{r.type}</p>
                                        <p className="text-neutral-700">{r.description}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="card p-6" id="meta">
                            <h2 className="text-2xl font-semibold text-neutral-900 mb-3">Metadatos</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-neutral-700">
                                <div>
                                    <p className="text-xs text-neutral-500">Estudiante</p>
                                    <p className="font-medium text-neutral-900">{charter.student?.name} <span className="text-sm text-neutral-500">({charter.student?.email})</span></p>
                                </div>
                                <div>
                                    <p className="text-xs text-neutral-500">Enviado</p>
                                    <p className="font-medium">{charter.submitted_at ? new Date(charter.submitted_at).toLocaleString() : (charter.submittedAt ?? "-")}</p>
                                </div>
                            </div>
                        </section>

                        <section className="card p-6" id="grade-panel">
                            <h2 className="text-2xl font-semibold text-neutral-900 mb-3">Calificación</h2>
                            <GradePanel charterId={charter.id} />
                        </section>

                    </div>
                </div>
            </main>
        </div>
    );
}

function Card({ label, value }: any) {
    return (
        <div className="p-4 bg-white border rounded-xl">
            <p className="text-gray-400 text-xs">{label}</p>
            <p className="font-medium">{value ?? "—"}</p>
        </div>
    );
}
