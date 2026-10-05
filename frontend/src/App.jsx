import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import "./App.css";

import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import HRDashboard from "./pages/HRDashboard";
import MentorDashboard from "./pages/MentorDashboard";
import InternDashboard from "./pages/InternDashboard";

import { jwtDecode } from "jwt-decode";

import HRInternCreate from "./pages/HRInternCreate";
import HRInterns from "./pages/HRInterns";
import HRInternEdit from "./pages/HRInternEdit";
import HRInternDocuments from "./pages/HRInternDocuments";
import InternApplication from "./pages/InternApplication";

// ==============================
// LẤY USER TỪ JWT
// ==============================

const getUserFromToken = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return null;
  }

  try {
    return jwtDecode(token);
  } catch {
    localStorage.removeItem("token");
    return null;
  }
};

// ==============================
// KIỂM TRA ROLE
// ==============================

function RoleBasedDashboard() {
  const currentUser = getUserFromToken();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  switch (currentUser.role) {
    case "admin":
      return <AdminDashboard />;

    case "hr":
      return <HRDashboard />;

    case "mentor":
      return <MentorDashboard />;

    case "intern":
      return <InternDashboard />;

    default:
      localStorage.removeItem("token");

      return (
        <Navigate
          to="/login"
          replace
        />
      );
  }
}

// ==============================
// APP
// ==============================

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* DASHBOARD THEO ROLE */}
        <Route
          path="/"
          element={<RoleBasedDashboard />}
        />

        {/* URL KHÔNG TỒN TẠI */}
        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

        <Route
          path="/hr/interns/create"
          element={<HRInternCreate />}
        />
        <Route
          path="/hr/interns"
          element={<HRInterns />}
        />
        <Route
          path="/hr/interns/:internId/edit"
          element={<HRInternEdit />}
        />
        <Route
          path="/hr/interns/:internId/documents"
          element={<HRInternDocuments />}
        />
        <Route
          path="/intern/application"
          element={<InternApplication />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;