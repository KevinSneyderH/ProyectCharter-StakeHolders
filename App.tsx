import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import { ProjectCharterForm } from "./ProjectCharterForm";
import type { ReactNode } from "react";
import ProfessorDashboard from "./ProfessorDashboard";
import CharterDetail from "./CharterDetail";
import StudentDashboard from "./StudentDashboard";
import Register from "./Register";

function PrivateRoute({ children }: { children: ReactNode }) {
    const token = localStorage.getItem("token");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}

export default function App() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
                path="/"
                element={
                    <PrivateRoute>
                        <StudentDashboard />
                    </PrivateRoute>
                }
            />

            <Route
                path="/create"
                element={
                    <PrivateRoute>
                        <ProjectCharterForm />
                    </PrivateRoute>
                }
            />

            <Route path="/professor" element={<ProfessorDashboard />} />
            <Route path="/charters/:id" element={<CharterDetail />} />

            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}