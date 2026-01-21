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

// Configurações de compressão
const MAX_IMAGE_WIDTH = 1200; // Largura máxima em pixels
const IMAGE_QUALITY = 0.7; // Qualidade de compressão (0.7 = 70%)

/**
 * Comprime uma imagem antes do upload
 * Reduz tamanho e dimensões para acelerar o envio
 */
async function compressImage(file: File): Promise<File> {
    // Se não for imagem, retorna o arquivo original
    if (!file.type.startsWith('image/')) {
        return file;
    }

    // Se já for pequena (< 500KB), não precisa comprimir
    if (file.size < 500 * 1024) {
        return file;
    }

    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            // Calcular novas dimensões mantendo proporção
            let { width, height } = img;

            if (width > MAX_IMAGE_WIDTH) {
                height = (height * MAX_IMAGE_WIDTH) / width;
                width = MAX_IMAGE_WIDTH;
            }

            canvas.width = width;
            canvas.height = height;

            // Desenhar imagem redimensionada
            ctx?.drawImage(img, 0, 0, width, height);

            // Converter para blob comprimido
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        // Criar novo arquivo com o blob comprimido
                        const compressedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });
                        console.log(`Imagem comprimida: ${(file.size / 1024).toFixed(0)}KB → ${(compressedFile.size / 1024).toFixed(0)}KB`);
                        resolve(compressedFile);
                    } else {
                        resolve(file);
                    }
                },
                'image/jpeg',
                IMAGE_QUALITY
            );
        };

        img.onerror = () => resolve(file);
        img.src = URL.createObjectURL(file);
    });
}

export async function uploadImage(file: File): Promise<string | null> {
    try {
        // Comprimir imagem antes do upload
        const compressedFile = await compressImage(file);

        // Generate unique filename (sempre .jpg após compressão)
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.jpg`;
        const filePath = `uploads/${fileName}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(filePath, compressedFile, {
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
