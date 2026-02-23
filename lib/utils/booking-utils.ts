import { addMinutes, isAfter, isBefore, parseISO, format, startOfDay, endOfDay } from 'date-fns';
import { OccupationInterval } from './booking-fetcher';

export interface Interval {
    start: Date;
    end: Date;
}

export interface Slot {
    start: Date;
    end: Date;
}

/**
 * Calcule les créneaux disponibles pour une durée donnée sur une plage d'ouverture.
 * Algorithme "Intervalleur" (O(N)) par soustraction géométrique.
 */
export function getAvailableSlots(
    dayStart: Date,
    dayEnd: Date,
    durationMinutes: number,
    occupied: OccupationInterval[]
): Slot[] {
    let currentTime = dayStart;
    const slots: Slot[] = [];

    // Convertir les intervalles occupés en objets Date pour la manipulation
    const occupiedIntervals: Interval[] = occupied.map(occ => ({
        start: parseISO(occ.start_time),
        end: parseISO(occ.end_time)
    })).filter(interval => {
        // Garder seulement les intervalles qui intersectent la plage de la journée
        return isBefore(interval.start, dayEnd) && isAfter(interval.end, dayStart);
    }).sort((a, b) => a.start.getTime() - b.start.getTime());

    while (!isAfter(addMinutes(currentTime, durationMinutes), dayEnd)) {
        const slotEnd = addMinutes(currentTime, durationMinutes);

        // Trouver si le créneau actuel (currentTime -> slotEnd) chevauche un intervalle occupé
        const collision = occupiedIntervals.find(occ =>
            (isBefore(currentTime, occ.end) && isAfter(slotEnd, occ.start))
        );

        if (collision) {
            // Si collision, on saute après la fin de l'occupation
            currentTime = collision.end;
            // Optionnel: On peut aussi arrondir au prochain créneau régulier ici si nécessaire
        } else {
            // Si pas de collision, on ajoute le créneau et on avance
            slots.push({ start: currentTime, end: slotEnd });
            // On avance de 15, 30 min ou de la durée totale selon le besoin UX
            // Ici on avance de la durée du service pour des créneaux consécutifs
            currentTime = slotEnd;
        }
    }

    return slots;
}
