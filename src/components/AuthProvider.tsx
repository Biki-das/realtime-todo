import React, { createContext, useContext, useState, useEffect } from "react";

// Define the shape of the context
interface AuthContextType {
  user: any; // Replace 'any' with your user type
  token: string | null;
  login: (userCredentials: any) => void; // Replace 'any' with your credentials type
  logout: () => void;
  signup: (userCredentials: any) => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const login = (data: any) => {
    setUser({
      userName: data.username,
      token: data.token,
    });
    setToken(data.token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
