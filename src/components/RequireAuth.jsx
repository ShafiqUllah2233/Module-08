import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (!getTokenSync() && !loading) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface text-on-surface text-sm">
        Loading…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

function getTokenSync() {
  return localStorage.getItem("g08_token");
}
