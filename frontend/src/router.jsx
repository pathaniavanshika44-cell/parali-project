// import { createBrowserRouter, Navigate } from "react-router-dom";
// import SignUp from "./components/auth/SignUp";
// import SignIn from "./components/auth/SignIn";
// import DashboardWrapper from "./components/common/DashboardWrapper";

// const router = createBrowserRouter([
//   { path: "/", element: <Navigate to="/signin" /> },
//   { path: "/signup", element: <SignUp /> },
//   { path: "/signin", element: <SignIn /> },
//   { path: "/dashboard", element: <DashboardWrapper /> },
//   { path: "/dashboard/:section", element: <DashboardWrapper /> },
//   { path: "*", element: <Navigate to="/signin" /> },
// ]);

// export default router;









import { createBrowserRouter, Navigate } from "react-router-dom";
import SignUp from "./components/auth/SignUp";
import SignIn from "./components/auth/SignIn";
import FarmerDashboard from "./components/dashboards/FarmerDashboard";
import CbgDashboard from "./components/dashboards/CbgDashboard";
import CBGProfile from "./components/cbg/CBGProfile";

const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/signin" /> },
  { path: "/signup", element: <SignUp /> },
  { path: "/signin", element: <SignIn /> },

  // Farmer
  { path: "/farmer/dashboard", element: <FarmerDashboard /> },
  { path: "/farmer/dashboard/:section", element: <FarmerDashboard /> },

  // CBG
  { path: "/cbg/dashboard", element: <CbgDashboard /> },
  { path: "/cbg/dashboard/:section", element: <CbgDashboard /> },

  // ✅ FIXED PROFILE ROUTE
  { path: "/cbg/dashboard/profile", element: <CBGProfile /> },

  { path: "*", element: <Navigate to="/signin" /> },
]);

export default router;