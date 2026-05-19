import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import { ProjectCharterForm } from "./ProjectCharterForm";

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<ProjectCharterForm />} />
            <Route path="/login" element={<Login />} />

            {/* fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}