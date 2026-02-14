import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAgenda } from './useAgenda'
import { createClient } from '@/lib/supabase/client'

// stable mock instance
const mockSupabaseInstance = {
    auth: {
        getUser: vi.fn(),
    },
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn(),
}

vi.mock('@/lib/supabase/client', () => ({
    createClient: vi.fn(() => mockSupabaseInstance),
}))

describe('useAgenda', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockSupabaseInstance.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null })
        mockSupabaseInstance.single.mockResolvedValue({ data: { id: 'est-123' }, error: null })
        mockSupabaseInstance.order.mockResolvedValue({ data: [], error: null })
    })

    it('devrait charger l\'établissement au montage', async () => {
        const { result } = renderHook(() => useAgenda())

        await waitFor(() => {
            expect(result.current.establishmentId).toBe('est-123')
            expect(result.current.loading).toBe(false)
        })
    })

    it('devrait permettre de changer la vue', async () => {
        const { result } = renderHook(() => useAgenda())

        await act(async () => {
            result.current.setView('day')
        })

        expect(result.current.view).toBe('day')
    })

    it('devrait permettre de changer la date courant', async () => {
        const { result } = renderHook(() => useAgenda())
        const newDate = new Date('2026-03-01T10:00:00Z')

        await act(async () => {
            result.current.setCurrentDate(newDate)
        })

        expect(result.current.currentDate.getTime()).toBe(newDate.getTime())
    })

    it('devrait charger les événements quand l\'établissement est prêt', async () => {
        const { result } = renderHook(() => useAgenda())

        await waitFor(() => {
            expect(result.current.establishmentId).toBe('est-123')
        })

        expect(mockSupabaseInstance.from).toHaveBeenCalledWith('appointments')
        expect(mockSupabaseInstance.from).toHaveBeenCalledWith('unavailabilities')
    })
})
