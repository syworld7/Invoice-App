import { useState } from 'react';
import { apiClient, formatParamDate } from '../services/api';
import type { Invoice, InvoiceDetails, TrendItem, TopItem } from '../types';

export const useInvoicesApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getInvoicesList = async (fromDate: string, toDate: string): Promise<Invoice[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/Invoice/GetList', { params: { fromDate, toDate } });
      const invoicesData = response.data || [];
      
      return await Promise.all(
        invoicesData.map(async (inv: Invoice) => {
          let itemsCount = 0;
          try {
            const detailRes = await apiClient.get(`/Invoice/${inv.invoiceID}`);
            itemsCount = detailRes.data?.lines?.length || 0;
          } catch (e) {
            console.error(e);
          }
          return { ...inv, itemsCount };
        })
      );
    } catch (err) {
      setError('Failed to fetch invoice list. Please check connection.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getInvoiceDetails = async (invoiceID: number): Promise<InvoiceDetails> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/Invoice/${invoiceID}`);
      return response.data;
    } catch (err) {
      setError('Failed to load invoice details.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteInvoice = async (invoiceID: number) => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.delete(`/Invoice/${invoiceID}`);
    } catch (err) {
      setError('Could not delete invoice. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const saveInvoice = async (payload: any, isEdit: boolean, updatedOn: string | null = null) => {
    setLoading(true);
    setError(null);
    try {
      if (isEdit) {
        await apiClient.put('/Invoice', { ...payload, updatedOn });
      } else {
        await apiClient.post('/Invoice', payload);
      }
    } catch (err: any) {
      console.error(err);
      let msg = 'Failed to save invoice.';
      if (err.response?.status === 412) {
        msg = 'Record already modified by another user. Concurrency conflict occurred. Please reload and try again.';
      } else if (err.response?.data) {
        const data = err.response.data;
        msg = typeof data === 'string' ? data : data.error || msg;
      }
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const getMetrics = async (fromDate: string, toDate: string) => {
    try {
      const response = await apiClient.get('/Invoice/GetMetrices', { params: { fromDate, toDate } });
      if (response.data && response.data.length > 0) {
        return {
          invoiceCount: response.data[0].invoiceCount || 0,
          totalAmount: response.data[0].totalAmount || 0
        };
      }
      return { invoiceCount: 0, totalAmount: 0 };
    } catch (err) {
      console.error('Metrics failed:', err);
      return { invoiceCount: 0, totalAmount: 0 };
    }
  };

  const getTopItems = async (fromDate: string, toDate: string, topN: number): Promise<TopItem[]> => {
    try {
      const response = await apiClient.get('/Invoice/TopItems', { params: { fromDate, toDate, topN } });
      return response.data || [];
    } catch (err) {
      console.error('TopItems failed:', err);
      return [];
    }
  };

  const getTrend12m = async (): Promise<TrendItem[]> => {
    try {
      const todayStr = formatParamDate(new Date());
      const response = await apiClient.get('/Invoice/GetTrend12m', { params: { asOf: todayStr } });
      return response.data || [];
    } catch (err) {
      console.error('Trend failed:', err);
      return [];
    }
  };

  return {
    loading,
    error,
    getInvoicesList,
    getInvoiceDetails,
    deleteInvoice,
    saveInvoice,
    getMetrics,
    getTopItems,
    getTrend12m,
    setError
  };
};
