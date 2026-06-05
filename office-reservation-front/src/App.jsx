import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ResourcePage from "./pages/ResourcePage";
import ReservationPage from "./pages/ReservationPage";
import MyReservationPage from "./pages/MyReservationPage";
import AdminPage from "./pages/AdminPage";
import Navbar from "./components/Navbar";

const isLoggedIn = () => !!localStorage.getItem("accessToken");
const isAdmin = () => localStorage.getItem("userRole") === "ROLE_ADMIN";

const PrivateRoute = ({ children }) => {
  return isLoggedIn() ? (
    <>
      <Navbar />
      {children}
    </>
  ) : (
    <Navigate to="/login" />
  );
};

const AdminRoute = ({ children }) => {
  return isAdmin() ? (
    <>
      <Navbar />
      {children}
    </>
  ) : (
    <Navigate to="/" />
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <ResourcePage />
            </PrivateRoute>
          }
        />

        <Route
          path="/reservations"
          element={
            <PrivateRoute>
              <ReservationPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/my-reservations"
          element={
            <PrivateRoute>
              <MyReservationPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
