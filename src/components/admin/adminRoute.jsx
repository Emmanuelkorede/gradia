import { Navigate } from "react-router";
import { useAuth } from "../../hooks/useAuth";

export default function AdminRoute({ children }) {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1f0e] flex items-center justify-center text-emerald-400 font-mono">
        Verifying Security Credentials...
      </div>
    );
  }

  // 2. If no one is logged in, or they are just a student, throw them back to home
  if (!profile || profile.role !== "admin") {
    console.warn("🚫 Security Access Denied: Unauthorized account attempt.");
    return <Navigate to="/home" replace />;
  }

  // 3. If they are officially an admin, render the admin dashboard page safely
  return children;
}