import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface DbPNR {
    id: string;
    number: string;
    address: string;
    block: string;
    created_at: string;
}

export interface DbMaintenanceRequest {
    id: string;
    pnr_number: string;
    pnr_address: string;
    requester_name: string;
    requester_rank: string;
    category: 'pedreiro' | 'marceneiro' | 'eletricista' | 'hidraulica' | 'pintura' | 'outros';
    description: string;
    is_urgent: boolean;
    is_archived: boolean;
    images: string[];
    status: 'pendente' | 'aprovado' | 'negado';
    denial_reason: string | null;
    created_at: string;
    updated_at: string;
}


// Image upload functions
const BUCKET_NAME = 'maintenance-images';

export async function uploadImage(file: File): Promise<string | null> {
    try {
        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `uploads/${fileName}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            console.error('Upload error:', uploadError);
            return null;
        }

        // Get public URL
        const { data } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(filePath);

        return data.publicUrl;
    } catch (err) {
        console.error('Error uploading image:', err);
        return null;
    }
}

export async function uploadMultipleImages(files: File[]): Promise<string[]> {
    const uploadPromises = files.map(file => uploadImage(file));
    const results = await Promise.all(uploadPromises);
    return results.filter((url): url is string => url !== null);
}

export async function deleteImage(imageUrl: string): Promise<boolean> {
    try {
        // Extract file path from URL
        const urlParts = imageUrl.split(`${BUCKET_NAME}/`);
        if (urlParts.length < 2) return false;

        const filePath = urlParts[1];

        const { error } = await supabase.storage
            .from(BUCKET_NAME)
            .remove([filePath]);

        if (error) {
            console.error('Delete error:', error);
            return false;
        }

        return true;
    } catch (err) {
        console.error('Error deleting image:', err);
        return false;
    }
}
