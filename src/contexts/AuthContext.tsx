import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 
  'faculty' | 
  'hod' | 
  'so' | 
  'po' | 
  'principal' | 
  'payment_officer' | 
  'ao' | 
  'admin';

interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  department?: string;
}

interface AuthContextType {
  user: User | null;
  login: (
    role: UserRole,
    username: string,
    password: string,
    department?: string
  ) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = (
    role: UserRole,
    username: string,
    password: string,
    department?: string
  ) => {
    const newUser: User = {
      id: Date.now().toString(),
      username,
      password,
      role,
      department,
    };
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
