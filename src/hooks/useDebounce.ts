import { useState, useEffect } from 'react';

/**
 * Hook para aplicar debounce em valores
 * Útil para otimizar buscas e filtros que não precisam executar a cada tecla
 * 
 * @param value - Valor a ser debounced
 * @param delay - Tempo de espera em milissegundos (padrão: 300ms)
 * @returns Valor debounced
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}
