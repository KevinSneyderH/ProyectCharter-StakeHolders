import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "./src/api/auth";

interface NavBarProps {
    userName: string;
    userRole?: "student" | "professor";
}

export default function NavBar({ userName, userRole = "student" }: NavBarProps) {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
        } finally {
            localStorage.removeItem("token");
            navigate("/login");
        }
    };

    const go = (path: string) => {
        navigate(path);
        setOpen(false);
    };

    return (
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-sm">
            <div className="container-responsive py-4 flex items-center justify-between">

                {/* LEFT */}
                <div className="flex items-center gap-4">
                    <div
                        className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md cursor-pointer"
                        onClick={() => navigate(userRole === "professor" ? "/professor" : "/")}
                    >
                        <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                    </div>

                    <div className="hidden sm:block">
                        <p className="text-sm font-bold text-neutral-900">
                            Project Charter
                        </p>
                    </div>
                </div>

                {/* DESKTOP NAV */}
                <nav className="hidden md:flex items-center gap-6">
                    {userRole === "student" && (
                        <>
                            <button
                                onClick={() => navigate("/")}
                                className="text-sm font-medium text-neutral-700 hover:text-blue-600"
                            >
                                Mis Charters
                            </button>

                            <button
                                onClick={() => navigate("/create")}
                                className="text-sm font-medium text-neutral-700 hover:text-blue-600"
                            >
                                Crear Charter
                            </button>
                        </>
                    )}

                    {userRole === "professor" && (
                        <button
                            onClick={() => navigate("/professor")}
                            className="text-sm font-medium text-neutral-700 hover:text-blue-600"
                        >
                            Panel Profesor
                        </button>
                    )}
                </nav>

                {/* RIGHT - USER SaaS STYLE */}
                <div className="flex items-center gap-3 relative">

                    {/* USER CARD */}
                    <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-full bg-neutral-100 border">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                            {userName?.charAt(0)?.toUpperCase()}
                        </div>

                        <div className="flex flex-col leading-tight">
                            <span className="text-sm font-semibold text-neutral-800">
                                {userName}
                            </span>
                            <span className="text-[11px] text-neutral-500 capitalize">
                                {userRole}
                            </span>
                        </div>
                    </div>

                    {/* MOBILE MENU BUTTON */}
                    <button
                        className="md:hidden p-2 rounded-lg border"
                        onClick={() => setOpen(!open)}
                    >
                        ☰
                    </button>

                    {/* LOGOUT BUTTON */}
                    <button
                        onClick={handleLogout}
                        className="px-3 py-2 rounded-lg text-sm font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition"
                    >
                        Salir
                    </button>
                </div>
            </div>

            {/* MOBILE MENU */}
            {open && (
                <div className="md:hidden border-t bg-white px-4 py-3 space-y-3">

                    {userRole === "student" && (
                        <>
                            <button
                                onClick={() => go("/")}
                                className="block w-full text-left text-sm py-2"
                            >
                                Mis Charters
                            </button>

                            <button
                                onClick={() => go("/create")}
                                className="block w-full text-left text-sm py-2"
                            >
                                Crear Charter
                            </button>
                        </>
                    )}

                    {userRole === "professor" && (
                        <button
                            onClick={() => go("/professor")}
                            className="block w-full text-left text-sm py-2"
                        >
                            Panel Profesor
                        </button>
                    )}

                    <div className="text-xs text-gray-500 pt-2 border-t">
                        {userName}
                    </div>
                </div>
            )}
        </header>
    );
}