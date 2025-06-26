import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define permissions for each role
const rolePermissions = {
  admin: [
    'manage_students',
    'generate_qr',
    'view_attendance',
    'manage_backup',
    'manage_access',
    'mark_attendance'
  ],
  teacher: [
    'view_attendance',
    'mark_attendance',
    'print_reports'
  ]
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        try{
          const decodedPayload: any = JSON.parse(atob(storedToken.split('.')[1]));
          if (decodedPayload && decodedPayload.exp * 1000 > Date.now()){
            setUser({
              id: decodedPayload.id,
              name: decodedPayload.name || decodedPayload.email, // get name from payload or email
              email: decodedPayload.email,
              role: decodedPayload.role
            });
          } else {
            localStorage.removeItem('authToken'); // Erase expired token
          }
        }catch (error) {
          console.error("Failed to decode tokenor token invalid", error);
          localStorage.removeItem('authToken');
        }
      }
      setLoading(false);
    };
    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Panggil API login dari backend
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;

      // Simpan token di localStorage
      localStorage.setItem('authToken', token);
      // Set user di state AuthContext
      setUser(userData);
      return true; // Login berhasil
    } catch (error) {
      console.error('Login failed:', error);
      // Tangani error dari backend (misal: 401 Unauthorized)
      // Contoh: if (axios.isAxiosError(error) && error.response?.status === 401) { ... }
      return false; // Login gagal
    }
  };

  const logout = () => {
      localStorage.removeItem('authToken');
      setUser(null);
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return rolePermissions[user.role]?.includes(permission) || false;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    hasPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};