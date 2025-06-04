import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import React from "react";

// Tipo para los datos del usuario
interface UserData {
  username: string;
}

// Tipo del contexto
export interface AuthContextType {
  login: (email: string, password: string) => Promise<UserData>;
  logout: () => void;
  user: string | null;
  setUser: React.Dispatch<React.SetStateAction<string | null>>;
  isAuthenticated: boolean; // Añadido
}

// Crear el contexto
const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

// Hook personalizado
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

// Proveedor
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<string | null>(null);

  const login = async (email: string, password: string): Promise<UserData> => {
    const response = await fetch("http://localhost:5000/procesar_login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: email, password }),
      credentials: "include",
    });

    if (!response.ok) throw new Error("Credenciales incorrectas");

    const data: UserData = await response.json();
    setUser(data.username);
    return data;
  };

  const logout = () => {
    setUser(null);
    // Podrías hacer una llamada al backend para cerrar sesión si lo deseas
  };

  const verificarSesion = async () => {
    try {
      const response = await axios.get("http://localhost:5000/verificar_sesion", {
        withCredentials: true,
      });

      if (response.status === 200) {
        setUser(response.data.username);
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err.response?.status === 401) {
        setUser(null);
      } else {
        console.error("Error al verificar sesión:", err);
      }
    }
  };

  useEffect(() => {
    verificarSesion();
  }, []);

  const isAuthenticated = !!user; // ✅ Lo añadimos aquí

  return (
    <AuthContext.Provider value={{ login, logout, user, setUser, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export type { UserData };
