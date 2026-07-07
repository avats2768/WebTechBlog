import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import Login from "../pages/login/Login";
import Register from "../pages/register/Register";
import Dashboard from "../pages/dashboard/Dashboard";
import SavePost from "../pages/post/SavePost";
import OpenPost from "../pages/post/OpenPost";
import ProfilePage from "../pages/profile/Profile";
import { ThemeDemo } from "../pages/ThemeDemo";

import ProtectedRoute from "./ProtectedRoute";
import UpdateProfile from "../pages/profile/UpdateProfile";
import Bookmarks from "../pages/post/BookMark";
import LikedPosts from "../pages/post/LikedPost";
import HistoryPage from "../pages/history/History";
import PublicProfilePage from "../pages/profile/PublicUserProfile";
import ChatPage from "../pages/chat/ChatPage";
import ChatList from "../pages/chat/ChatList";
import Settings from "../pages/settings/Settings";

export default function AppRoutes() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />}
      />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/save-post"
        element={
          <ProtectedRoute>
            <SavePost />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/public-profile/:uuid"
        element={
          <ProtectedRoute>
            <PublicProfilePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/update-profile"
        element={
          <ProtectedRoute>
            <UpdateProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/bookmarks"
        element={
          <ProtectedRoute>
            <Bookmarks />
          </ProtectedRoute>
        }
      />

      <Route
        path="/liked"
        element={
          <ProtectedRoute>
            <LikedPosts />
          </ProtectedRoute>
        }
      />

      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <HistoryPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <ChatList />
          </ProtectedRoute>
        }
      />

      <Route path="/settings" element={<Settings />} />

      <Route path="/theme-demo" element={<ThemeDemo />} />
      <Route path="/post/:id" element={<OpenPost />} />
    </Routes>
  );
}
