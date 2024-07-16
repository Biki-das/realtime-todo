import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { SignInForm } from "./components/Signin.tsx";
import { SignUpForm } from "./components/Signup.tsx";
import { AuthProvider } from "./components/AuthProvider.tsx";
import { ProtectedRoute } from "./components/Route/ProtectedRoute.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <App />,
      </ProtectedRoute>
    ),
  },
  {
    path: "/Signin",
    element: <SignInForm />,
  },
  {
    path: "/Signup",
    element: <SignUpForm />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
