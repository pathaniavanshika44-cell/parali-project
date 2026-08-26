// src/components/common/DashboardRouter.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

import FarmerDashboard from "../dashboards/FarmerDashboard";
import CbgDashboard from "../dashboards/CbgDashboard";
import TransportDashboard from "../dashboards/TransportDashboard";

const DashboardRouter = () => {
  const [userType, setUserType] = useState(null); // "farmer", "cbg", "transport"
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserType = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        alert("Please login first!");
        setLoading(false);
        return;
      }

      // Fetch user type from your `users` table
      const { data, error } = await supabase
        .from("users")
        .select("user_type") // make sure this column exists
        .eq("id", user.id)
        .single();

      if (error || !data) {
        console.error("Error fetching user type:", error);
        alert("Failed to fetch user type");
      } else {
        setUserType(data.user_type);
      }
      setLoading(false);
    };

    fetchUserType();
  }, []);

  if (loading) return <p>Loading dashboard...</p>;

  switch (userType) {
    case "farmer":
      return <FarmerDashboard />;
    case "cbg":
      return <CbgDashboard />;
    case "transport":
      return <TransportDashboard />;
    default:
      return <p>Unknown user type. Please check your account.</p>;
  }
};

export default DashboardRouter;