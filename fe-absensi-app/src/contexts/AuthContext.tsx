// fe-absensi-app/src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';
import axios from 'axios';

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

// Ini Wajib Kamu Ingat! (Definisi Izin per Role)
// Pastikan 'admin' memiliki permission 'manage_classes' agar bisa mengakses halaman kelas.
const rolePermissions = {
  admin: [
    'manage_students',
    'generate_qr',
    'view_attendance',
    'manage_backup',
    'manage_access',
    'mark_attendance',
    'send_notification',
    'manage_users',
    'manage_classes' // PERBAIKAN: Tambahkan permission 'manage_classes' untuk admin
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
        try {
          const decodedPayload: any = JSON.parse(atob(storedToken.split('.')[1]));
          if (decodedPayload && decodedPayload.exp * 1000 > Date.now()) {
            setUser({
              id: decodedPayload.id,
              name: decodedPayload.name || decodedPayload.email,
              email: decodedPayload.email,
              role: decodedPayload.role
            });
          } else {
            localStorage.removeItem('authToken');
          }
        } catch (error) {
          console.error("Gagal mendecode token atau token tidak valid", error);
          localStorage.removeItem('authToken');
        }
      }
      setLoading(false);
    };
    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;

      localStorage.setItem('authToken', token);
      setUser(userData);
      return true;
    } catch (error) {
      console.error('Login gagal:', error);
      return false;
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
