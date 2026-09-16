import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, checking } = useAuth();

  if (checking) {
    return (
      <div className="loading-screen">
        <div className="loader-cube">
          <div />
        </div>
        Loading your challenge
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}
