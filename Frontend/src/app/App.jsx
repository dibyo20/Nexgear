import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import "./App.scss";
import { routes } from "../app/app.routes.jsx";
import { useAuth } from "../features/auth/hook/useAuth.js";

const App = () => {
  const { handleGetMe } = useAuth();

  useEffect(() => {
    handleGetMe();
  }, []);
  return (
    <>
      <RouterProvider router={routes} />
    </>
  );
};

export default App;
