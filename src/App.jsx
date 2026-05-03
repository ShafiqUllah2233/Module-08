import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import DisputesList from "./pages/DisputesList";
import NewDispute from "./pages/NewDispute";
import DisputeDetail from "./pages/DisputeDetail";
import MediationRoom from "./pages/MediationRoom";
import StatusHistory from "./pages/StatusHistory";
import AdminQueue from "./pages/AdminQueue";
import AdminProfiles from "./pages/AdminProfiles";
import AdminReview from "./pages/AdminReview";
import ArbitrationDecision from "./pages/ArbitrationDecision";
import ResolutionReport from "./pages/ResolutionReport";
import AuditLog from "./pages/AuditLog";
import UserProfile from "./pages/UserProfile";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/disputes" replace />} />
        <Route path="/disputes" element={<DisputesList />} />
        <Route path="/disputes/new" element={<NewDispute />} />
        <Route path="/disputes/:id" element={<DisputeDetail />} />
        <Route path="/disputes/:id/mediation" element={<MediationRoom />} />
        <Route path="/disputes/:id/history" element={<StatusHistory />} />

        {/* Admin */}
        <Route path="/admin" element={<Navigate to="/admin/queue" replace />} />
        <Route path="/admin/queue" element={<AdminQueue />} />
        <Route path="/admin/profiles" element={<AdminProfiles />} />
        <Route path="/admin/audit-log" element={<AuditLog />} />
        <Route path="/admin/disputes/:id/review" element={<AdminReview />} />
        <Route
          path="/admin/disputes/:id/arbitration"
          element={<ArbitrationDecision />}
        />
        <Route
          path="/admin/disputes/:id/resolution"
          element={<ResolutionReport />}
        />

        {/* User */}
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/settings" element={<Settings />} />

        <Route path="*" element={<Navigate to="/disputes" replace />} />
      </Routes>
    </Layout>
  );
}
