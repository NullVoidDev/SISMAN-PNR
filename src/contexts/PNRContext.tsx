import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase, DbPNR } from '@/lib/supabase';
import { PNR } from '@/types';

interface PNRContextType {
    pnrs: PNR[];
    isLoading: boolean;
    addPNR: (pnr: Omit<PNR, 'id'>) => Promise<PNR | null>;
    updatePNR: (id: string, pnr: Omit<PNR, 'id'>) => Promise<boolean>;
    deletePNR: (id: string) => Promise<boolean>;
    refreshPNRs: () => Promise<void>;
}

const PNRContext = createContext<PNRContextType | undefined>(undefined);

function dbToPNR(db: DbPNR): PNR {
    return {
        id: db.id,
        number: db.number,
        address: db.address,
        block: db.block,
    };
}

export function PNRProvider({ children }: { children: ReactNode }) {
    const [pnrs, setPnrs] = useState<PNR[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchPNRs = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('pnrs')
                .select('*')
                .order('number');

            if (error) {
                console.error('Error fetching PNRs:', error);
                return;
            }

            const mapped = (data || []).map(dbToPNR);
            setPnrs(mapped);
        } catch (err) {
            console.error('Error fetching PNRs:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPNRs();
    }, [fetchPNRs]);

    const addPNR = async (pnr: Omit<PNR, 'id'>): Promise<PNR | null> => {
        try {
            const { data, error } = await supabase
                .from('pnrs')
                .insert({
                    number: pnr.number,
                    address: pnr.address,
                    block: pnr.block,
                })
                .select()
                .single();

            if (error) {
                console.error('Error adding PNR:', error);
                return null;
            }

            const newPNR = dbToPNR(data);
            setPnrs(prev => [...prev, newPNR].sort((a, b) => a.number.localeCompare(b.number)));
            return newPNR;
        } catch (err) {
            console.error('Error adding PNR:', err);
            return null;
        }
    };

    const updatePNR = async (id: string, pnr: Omit<PNR, 'id'>): Promise<boolean> => {
        try {
            const { error } = await supabase
                .from('pnrs')
                .update({
                    number: pnr.number,
                    address: pnr.address,
                    block: pnr.block,
                })
                .eq('id', id);

            if (error) {
                console.error('Error updating PNR:', error);
                return false;
            }

            setPnrs(prev =>
                prev.map(p =>
                    p.id === id ? { ...pnr, id } : p
                ).sort((a, b) => a.number.localeCompare(b.number))
            );

            return true;
        } catch (err) {
            console.error('Error updating PNR:', err);
            return false;
        }
    };

    const deletePNR = async (id: string): Promise<boolean> => {
        try {
            console.log('Attempting to delete PNR with id:', id);

            const { error, count } = await supabase
                .from('pnrs')
                .delete({ count: 'exact' })
                .eq('id', id);

            console.log('Delete result - error:', error, 'count:', count);

            if (error) {
                console.error('Error deleting PNR:', error);
                return false;
            }

            // Verificar se realmente deletou algo
            if (count === 0) {
                console.error('No rows were deleted. Check RLS policies in Supabase.');
                return false;
            }

            // Refresh direto do banco para garantir sincronização
            await fetchPNRs();
            return true;
        } catch (err) {
            console.error('Error deleting PNR:', err);
            return false;
        }
    };

    return (
        <PNRContext.Provider value={{
            pnrs,
            isLoading,
            addPNR,
            updatePNR,
            deletePNR,
            refreshPNRs: fetchPNRs
        }}>
            {children}
        </PNRContext.Provider>
    );
}

export function usePNRs() {
    const context = useContext(PNRContext);
    if (!context) {
        throw new Error('usePNRs must be used within a PNRProvider');
    }
    return context;
}
