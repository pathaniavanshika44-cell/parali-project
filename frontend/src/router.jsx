import { createBrowserRouter, Navigate } from "react-router-dom";
import SignUp from "./components/auth/SignUp";
import SignIn from "./components/auth/SignIn";
import DashboardWrapper from "./components/common/DashboardWrapper";

const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/signin" /> },

  { path: "/signup", element: <SignUp /> },

  { path: "/signin", element: <SignIn /> },

  { path: "/dashboard", element: <DashboardWrapper /> },
]);

export default router;