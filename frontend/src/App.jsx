import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { useSelector } from "react-redux";

import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import Dashboard from "./pages/dashboard/Dashboard";
import AddPost from "./pages/addPost/AddPost";

import ProtectedRoute from "./routes/ProtectedRoute";
import { ThemeDemo } from "./pages/ThemeDemo"; // ← named import, not default

export default function App() {

  const isAuthenticated =
    useSelector(
      (state) => state.auth.isAuthenticated
    );

  return (
    <Routes>

      <Route
        path="/"
        element={
          <Navigate
            to={
              isAuthenticated
                ? "/dashboard"
                : "/login"
            }
          />
        }
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
  path="/add-post"
  element={
    <ProtectedRoute>
      <AddPost />
    </ProtectedRoute>
  }
/>

     
      <Route
        path="/theme-demo"
        element={<ThemeDemo />}
      />

    </Routes>
  );
}