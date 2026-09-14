import { createBrowserRouter } from "react-router-dom";
import Login from "../features/auth/pages/Login.jsx";
import Register from "../features/auth/pages/Register.jsx";
import ProtectedRoute from "../features/auth/components/ProtectedRoute.jsx";
import GuestRoute from "../features/auth/components/GuestRoute.jsx";
import Home from "../features/Product/pages/Home.jsx";
import Landing from "../features/Product/pages/Landing.jsx";
import ProductDetail from "../features/Product/pages/ProductDetail.jsx";
import Dashboard from "../features/Product/pages/Dashboard.jsx";
import CreateProduct from "../features/Product/pages/CreateProduct.jsx";
import SellerProductDetails from "../features/Product/pages/SellerProductDetails.jsx";

export const routes = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/home",
    element: <Home />,
  },
  {
    path: "/landing",
    element: <Landing />,
  },
  {
    path: "/products/:id",
    element: <ProductDetail />,
  },
  {
    path: "/register",
    element: (
      <GuestRoute>
        <Register />
      </GuestRoute>
    ),
  },
  {
    path: "/login",
    element: (
      <GuestRoute>
        <Login />
      </GuestRoute>
    ),
  },
  {
    path: "/seller/dashboard",
    element: (
      <ProtectedRoute allowedRoles={["seller"]}>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/seller/products/create",
    element: (
      <ProtectedRoute allowedRoles={["seller"]}>
        <CreateProduct />
      </ProtectedRoute>
    ),
  },
  {
    path: "/seller/products/:id",
    element: (
      <ProtectedRoute allowedRoles={["seller"]}>
        <SellerProductDetails />
      </ProtectedRoute>
    ),
  },
]);
