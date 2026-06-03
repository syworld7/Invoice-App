import { useState } from 'react';
import { apiClient } from '../services/api';

export const useAuthApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginUser = async (payload: any) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.post('/Auth/Login', payload);
      return res.data;
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data
        ? (typeof err.response.data === 'string' ? err.response.data : err.response.data.error || 'Invalid credentials')
        : 'Could not connect to authentication server.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const signupUser = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.post('/Auth/Signup', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data;
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data
        ? (typeof err.response.data === 'string' ? err.response.data : err.response.data.error || 'Signup failed')
        : 'Network connection failed during signup.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const getCompanyLogo = async (companyID: number) => {
    try {
      const response = await apiClient.get(`/Auth/GetCompanyLogoUrl/${companyID}`);
      return response.data;
    } catch (err) {
      console.log('No logo found or fetch failed:', err);
      return null;
    }
  };

  return {
    loading,
    error,
    loginUser,
    signupUser,
    getCompanyLogo,
    setError
  };
};
