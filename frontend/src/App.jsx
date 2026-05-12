import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout/Layout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

import MahasiswaPage from "./pages/admin/MahasiswaPage";
import DosenPage from "./pages/admin/DosenPage";
import UsersPage from "./pages/admin/UsersPage";

import MahasiswaProfilePage from "./pages/mahasiswa/ProfilePage";
import DosenListPage from "./pages/mahasiswa/DosenListPage";

import DosenProfilePage from "./pages/dosen/ProfilePage";
import BimbinganPage from "./pages/dosen/BimbinganPage";

function RootRedirect() {
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Navigate to="/login" replace />} />

      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />

        <Route element={<ProtectedRoute roles={["ADMIN"]} />}>
          <Route path="/admin/mahasiswa" element={<MahasiswaPage />} />
          <Route path="/admin/dosen" element={<DosenPage />} />
          <Route path="/admin/users" element={<UsersPage />} />
        </Route>

        <Route element={<ProtectedRoute roles={["USER"]} />}>
          <Route path="/mahasiswa/profile" element={<MahasiswaProfilePage />} />
          <Route path="/mahasiswa/dosen" element={<DosenListPage />} />
          <Route path="/dosen/profile" element={<DosenProfilePage />} />
          <Route path="/dosen/bimbingan" element={<BimbinganPage />} />
        </Route>
      </Route>

      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}
