import { RouterProvider } from "react-router-dom";
import "./App.scss";
import { routes } from "../app/app.routes.jsx";

const App = () => {
  return (
    <>
      <RouterProvider router={routes} />
    </>
  );
};

export default App;
