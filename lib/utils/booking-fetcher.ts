import { createClient } from '@/lib/supabase/client';

export interface OccupationInterval {
    start_time: string;
    end_time: string;
    type: 'appointment' | 'unavailability';
    id: string;
}
/**
 * Récupère les rendez-vous et indisponibilités pour un établissement sur une période donnée.
 * Utilise Promise.all pour paralléliser les requêtes.
 */
export async function fetchOccupationData(
    establishmentId: string,
    startDate: string,
    endDate: string
) {
    const supabase = createClient();

    const [appointmentsResult, unavailabilitiesResult] = await Promise.all([
        supabase
            .from('appointments')
            .select('*, service:services(name, duration, price)')
            .eq('establishment_id', establishmentId)
            .lte('start_time', endDate)
            .gte('end_time', startDate),
        supabase
            .from('unavailabilities')
            .select('*')
            .eq('establishment_id', establishmentId)
            .lte('start_time', endDate)
            .gte('end_time', startDate)
    ]);

    if (appointmentsResult.error) throw appointmentsResult.error;
    if (unavailabilitiesResult.error) throw unavailabilitiesResult.error;

    return {
        appointments: appointmentsResult.data || [],
        unavailabilities: unavailabilitiesResult.data || []
    };
}
