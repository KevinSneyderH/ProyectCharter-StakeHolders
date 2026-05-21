import { useNavigate } from "react-router-dom";
import { logout } from "./src/api/auth";

interface NavBarProps {
    userName: string;
    userRole?: "student" | "professor";
}

export default function NavBar({ userName, userRole = "student" }: NavBarProps) {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
        } finally {
            localStorage.removeItem("token");
            navigate("/login");
        }
    };

    return (
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-sm">
            <div className="container-responsive py-4 flex items-center justify-between">

                {/* LEFT */}
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate(userRole === "professor" ? "/professor" : "/")}>
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

                {/* MIDDLE - Navigation links */}
                <nav className="hidden md:flex items-center gap-6">
                    {userRole === "student" && (
                        <>
                            <button
                                onClick={() => navigate("/")}
                                className="text-sm font-medium text-neutral-700 hover:text-blue-600 transition-colors"
                            >
                                Mis Charters
                            </button>
                            <button
                                onClick={() => navigate("/create")}
                                className="text-sm font-medium text-neutral-700 hover:text-blue-600 transition-colors"
                            >
                                Crear Charter
                            </button>
                        </>
                    )}
                    {userRole === "professor" && (
                        <button
                            onClick={() => navigate("/professor")}
                            className="text-sm font-medium text-neutral-700 hover:text-blue-600 transition-colors"
                        >

                        </button>
                    )}
                </nav>

                {/* RIGHT */}
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-neutral-700">
                        {userName}
                    </span>

                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
                    >
                        Cerrar sesión
                    </button>
                </div>

            </div>
        </header>
    );
}