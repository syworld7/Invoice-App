import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import type { User, Company, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    const storedCompany = localStorage.getItem('company') || sessionStorage.getItem('company');

    if (storedToken && storedUser && storedCompany) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setCompany(JSON.parse(storedCompany));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (company?.companyID) {
      fetchCompanyLogo(company.companyID);
    } else {
      setLogoUrl(null);
    }
  }, [company]);

  const fetchCompanyLogo = async (companyID: number) => {
    try {
      const response = await apiClient.get(`/Auth/GetCompanyLogoUrl/${companyID}`);
      if (response.data) {
        setLogoUrl(response.data);
      }
    } catch (err) {
      console.log('No company logo uploaded yet or logo URL fetch failed:', err);
      setLogoUrl(null);
    }
  };

  const login = (newToken: string, newUser: User, newCompany: Company, rememberMe: boolean) => {
    setToken(newToken);
    setUser(newUser);
    setCompany(newCompany);

    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('token', newToken);
    storage.setItem('user', JSON.stringify(newUser));
    storage.setItem('company', JSON.stringify(newCompany));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setCompany(null);
    setLogoUrl(null);

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('company');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('company');
  };

  const updateCompanyDetails = (newCompany: Company) => {
    setCompany(newCompany);
    const rememberMe = localStorage.getItem('token') !== null;
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('company', JSON.stringify(newCompany));
  };

  const refreshLogo = async () => {
    if (company?.companyID) {
      await fetchCompanyLogo(company.companyID);
    }
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        company,
        token,
        logoUrl,
        isAuthenticated,
        isLoading,
        login,
        logout,
        updateCompanyDetails,
        refreshLogo,
      }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
