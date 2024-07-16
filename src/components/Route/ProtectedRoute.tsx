import React from "react";
import { Navigate } from "react-router-dom";

export function ProtectedRoute({ children }) {
  console.log(localStorage.getItem("token"));
  let token = localStorage.getItem("token");
  if (token === "undefined" || token === null) {
    return <Navigate to="/signin" />;
  }

  return children;
}
