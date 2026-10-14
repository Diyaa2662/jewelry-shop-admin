import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/layout/AdminLayout";
import Login from "./pages/Login";
import Products from "./pages/products/Products";
import Categories from "./pages/categories/Categories";
import Materials from "./pages/materials/Materials";
import FeaturedCategories from "./pages/featured-categories/FeaturedCategories";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Protected */}
          <Route
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/products" element={<Products />} />
            <Route path="/categories" element={<Categories />} />
            <Route
              path="/featured-categories"
              element={<FeaturedCategories />}
            />
            <Route path="/materials" element={<Materials />} />
          </Route>

          {/* Redirect */}
          <Route path="/" element={<Navigate to="/products" replace />} />
          <Route path="*" element={<Navigate to="/products" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
