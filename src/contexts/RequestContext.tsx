import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase, DbMaintenanceRequest } from '@/lib/supabase';
import { MaintenanceRequest, ServiceCategory } from '@/types';

interface RequestContextType {
  requests: MaintenanceRequest[];
  isLoading: boolean;
  addRequest: (request: Omit<MaintenanceRequest, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'isArchived'>) => Promise<MaintenanceRequest | null>;
  updateRequestStatus: (id: string, status: 'aprovado' | 'negado', denialReason?: string) => Promise<boolean>;
  toggleUrgent: (id: string, isUrgent: boolean) => Promise<boolean>;
  archiveRequest: (id: string) => Promise<boolean>;
  deleteRequest: (id: string) => Promise<boolean>;
  getRequestById: (id: string) => MaintenanceRequest | undefined;
  getRequestsByPnr: (pnrNumber: string) => MaintenanceRequest[];
  refreshRequests: () => Promise<void>;
}

const RequestContext = createContext<RequestContextType | undefined>(undefined);

// Convert database record to frontend type
function dbToMaintenanceRequest(db: DbMaintenanceRequest): MaintenanceRequest {
  return {
    id: db.id,
    pnrNumber: db.pnr_number,
    pnrAddress: db.pnr_address,
    requesterName: db.requester_name || '',
    requesterRank: db.requester_rank || '',
    category: db.category as ServiceCategory,
    description: db.description,
    isUrgent: db.is_urgent,
    isArchived: db.is_archived || false,
    images: db.images || [],
    status: db.status,
    denialReason: db.denial_reason || undefined,
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at),
  };
}

export function RequestProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching requests:', error);
        return;
      }

      const mapped = (data || []).map(dbToMaintenanceRequest);
      setRequests(mapped);
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const addRequest = async (request: Omit<MaintenanceRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<MaintenanceRequest | null> => {
    try {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .insert({
          pnr_number: request.pnrNumber,
          pnr_address: request.pnrAddress,
          requester_name: request.requesterName,
          requester_rank: request.requesterRank,
          category: request.category,
          description: request.description,
          is_urgent: request.isUrgent,
          images: request.images || [],
          status: 'pendente',
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding request:', error);
        return null;
      }

      const newRequest = dbToMaintenanceRequest(data);
      setRequests(prev => [newRequest, ...prev]);
      return newRequest;
    } catch (err) {
      console.error('Error adding request:', err);
      return null;
    }
  };

  const updateRequestStatus = async (id: string, status: 'aprovado' | 'negado', denialReason?: string): Promise<boolean> => {
    try {
      const updateData: { status: string; denial_reason?: string; updated_at: string } = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (denialReason) {
        updateData.denial_reason = denialReason;
      }

      const { error } = await supabase
        .from('maintenance_requests')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error updating request:', error);
        return false;
      }

      setRequests(prev =>
        prev.map(req =>
          req.id === id
            ? { ...req, status, denialReason, updatedAt: new Date() }
            : req
        )
      );

      return true;
    } catch (err) {
      console.error('Error updating request:', err);
      return false;
    }
  };

  const toggleUrgent = async (id: string, isUrgent: boolean): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('maintenance_requests')
        .update({
          is_urgent: isUrgent,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Error toggling urgent:', error);
        return false;
      }

      setRequests(prev =>
        prev.map(req =>
          req.id === id
            ? { ...req, isUrgent, updatedAt: new Date() }
            : req
        )
      );

      return true;
    } catch (err) {
      console.error('Error toggling urgent:', err);
      return false;
    }
  };

  const archiveRequest = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('maintenance_requests')
        .update({
          is_archived: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Error archiving request:', error);
        return false;
      }

      setRequests(prev =>
        prev.map(req =>
          req.id === id
            ? { ...req, isArchived: true, updatedAt: new Date() }
            : req
        )
      );

      return true;
    } catch (err) {
      console.error('Error archiving request:', err);
      return false;
    }
  };

  const deleteRequest = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('maintenance_requests')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting request:', error);
        return false;
      }

      setRequests(prev => prev.filter(req => req.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting request:', err);
      return false;
    }
  };

  const getRequestById = (id: string) => requests.find(r => r.id === id);

  const getRequestsByPnr = (pnrNumber: string) =>
    requests.filter(r => r.pnrNumber.toLowerCase() === pnrNumber.toLowerCase());

  return (
    <RequestContext.Provider value={{
      requests,
      isLoading,
      addRequest,
      updateRequestStatus,
      toggleUrgent,
      archiveRequest,
      deleteRequest,
      getRequestById,
      getRequestsByPnr,
      refreshRequests: fetchRequests
    }}>
      {children}
    </RequestContext.Provider>
  );
}

export function useRequests() {
  const context = useContext(RequestContext);
  if (!context) {
    throw new Error('useRequests must be used within a RequestProvider');
  }
  return context;
}
