import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import "./App.scss";
import { routes } from "../app/app.routes.jsx";
import { useAuth } from "../features/auth/hook/useAuth.js";
import { useCart } from "../features/cart/hooks/useCart.js";

const App = () => {
  const { user, handleGetMe } = useAuth();
  const { handleGetCart } = useCart();

  useEffect(() => {
    handleGetMe();
  }, []);

  useEffect(() => {
    if (user) {
      handleGetCart();
    }
  }, [user]);

  return (
    <>
      <RouterProvider router={routes} />
    </>
  );
};

export default App;
