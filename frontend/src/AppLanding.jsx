// src/components/AppLanding.jsx
import { Link } from "react-router-dom";

const AppLanding = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-4xl font-bold mb-6">React Supabase Auth</h1>
      <p className="mb-8 text-center text-gray-700">
        Welcome! Get started by signing up or logging in to access your dashboard.
      </p>

      <div className="flex space-x-4">
        <Link
          to="/signup"
          className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Sign Up
        </Link>
        <Link
          to="/signin"
          className="px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default AppLanding;