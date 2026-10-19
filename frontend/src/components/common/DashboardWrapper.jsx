import { useAuth } from "../../context/AuthContext";
import FarmerDashboard from "../dashboards/FarmerDashboard";
import CbgDashboard from "../dashboards/CbgDashboard";
import TransportDashboard from "../dashboards/TransportDashboard";

export default function DashboardWrapper() {
  const { role, loading } = useAuth();

  if (loading) return <p className="text-center mt-24">Loading...</p>;

  if (role === "farmer") return <FarmerDashboard />;
  if (role === "cbg_user") return <CbgDashboard />;
  if (role === "transport") return <TransportDashboard />;

  return <p className="text-center mt-24 text-red-500">Role not found</p>;
}