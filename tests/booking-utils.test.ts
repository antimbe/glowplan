import { describe, it, expect } from 'vitest';
import { getAvailableSlots } from '../lib/utils/booking-utils';
import { OccupationInterval } from '../lib/utils/booking-fetcher';

describe('getAvailableSlots (Intervalleur Algorithm)', () => {
    const serviceDuration = 30;
    const dayStart = new Date('2026-02-16T09:00:00Z');
    const dayEnd = new Date('2026-02-16T18:00:00Z');

    it('should calculate available slots correctly with no occupations', () => {
        const slots = getAvailableSlots(dayStart, dayEnd, serviceDuration, []);

        // 09:00 to 18:00 = 9h = 18 slots of 30min
        expect(slots.length).toBe(18);
        expect(formatTime(slots[0].start)).toBe('09:00');
        expect(formatTime(slots[slots.length - 1].start)).toBe('17:30');
    });

    it('should subtract overlapping appointments', () => {
        const occupations: OccupationInterval[] = [
            {
                id: 'app1',
                type: 'appointment',
                start_time: '2026-02-16T10:00:00Z',
                end_time: '2026-02-16T11:00:00Z'
            }
        ];

        const slots = getAvailableSlots(dayStart, dayEnd, serviceDuration, occupations);

        const times = slots.map(s => formatTime(s.start));
        expect(times).not.toContain('10:00');
        expect(times).not.toContain('10:30');
        expect(times).toContain('09:30');
        expect(times).toContain('11:00');
    });

    it('should handle middle occupation that is not on slot boundary', () => {
        const occupations: OccupationInterval[] = [
            {
                id: 'occ1',
                type: 'unavailability',
                start_time: '2026-02-16T10:15:00Z',
                end_time: '2026-02-16T10:45:00Z'
            }
        ];

        const slots = getAvailableSlots(dayStart, dayEnd, serviceDuration, occupations);

        const times = slots.map(s => formatTime(s.start));
        // 10:00 -> 10:30 (overlaps 10:15-10:45) -> SHOULD BE REMOVED
        // 10:15 -> (next available)
        // Wait, the algorithm moves currentTime to collision.end
        // If currentTime=10:00, slotEnd=10:30. 10:00-10:30 overlaps 10:15-10:45.
        // Collision detected. currentTime = 10:45.
        // Next slot starts at 10:45.

        expect(times).not.toContain('10:00');
        expect(times).toContain('09:30');
        expect(times).toContain('10:45');
    });
});

function formatTime(date: Date): string {
    return `${date.getUTCHours().toString().padStart(2, "0")}:${date.getUTCMinutes().toString().padStart(2, "0")}`;
}
