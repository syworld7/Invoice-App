import { useState } from 'react';
import { apiClient } from '../services/api';
import type { Item, LookupItem } from '../types';

export const useItemsApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getItemsList = async (): Promise<Item[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/Item/GetList');
      const itemsData = response.data || [];
      
      return await Promise.all(
        itemsData.map(async (item: Item) => {
          let picUrl = null;
          try {
            const picRes = await apiClient.get(`/Item/Picture/${item.itemID}`);
            picUrl = picRes.data || null;
          } catch (e) {
           console.error(e);
          }
          return { ...item, pictureUrl: picUrl };
        })
      );
    } catch (err) {
      const msg = 'Could not retrieve items catalog. Please check connection.';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getLookupList = async (): Promise<LookupItem[]> => {
    try {
      const response = await apiClient.get('/Item/GetLookupList');
      return response.data || [];
    } catch (err) {
      console.error('Failed to get item lookups:', err);
      return [];
    }
  };

  const getItemDetails = async (itemID: number): Promise<Item> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/Item/${itemID}`);
      return response.data;
    } catch (err) {
      setError('Failed to load item details.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const checkDuplicateName = async (itemName: string, excludeID: number): Promise<boolean> => {
    try {
      const res = await apiClient.get('/Item/CheckDuplicateItemName', {
        params: { ItemName: itemName, ExcludeID: excludeID }
      });
      return !!res.data;
    } catch (err) {
      return false;
    }
  };

  const saveItem = async (payload: any, isEdit: boolean, updatedOn: string | null = null) => {
    setLoading(true);
    setError(null);
    try {
      if (isEdit) {
        const res = await apiClient.put('/Item', { ...payload, updatedOn });
        return res.data;
      } else {
        const res = await apiClient.post('/Item', payload);
        return res.data;
      }
    } catch (err: any) {
      console.error(err);
      let msg = 'Failed to save item details.';
      if (err.response?.status === 412) {
        msg = 'Record already modified by another user. Please close this modal, reload the grid, and try again.';
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

  const uploadPicture = async (itemID: number, file: File) => {
    const formData = new FormData();
    formData.append('ItemID', itemID.toString());
    formData.append('File', file);
    try {
      await apiClient.post('/Item/UpdateItemPicture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } catch (err) {
      console.error('Image upload failed:', err);
    }
  };

  const deleteItem = async (itemID: number) => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.delete(`/Item/${itemID}`);
    } catch (err) {
      const msg = 'Failed to delete item. It may be linked to existing invoices.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const getItemPicture = async (itemID: number): Promise<string | null> => {
    try {
      const picRes = await apiClient.get(`/Item/Picture/${itemID}`);
      return picRes.data || null;
    } catch (e) {
      return null;
    }
  };

  return {
    loading,
    error,
    getItemsList,
    getLookupList,
    getItemDetails,
    checkDuplicateName,
    saveItem,
    uploadPicture,
    deleteItem,
    getItemPicture,
    setError
  };
};
