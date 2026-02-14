import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Supabase SSR
vi.mock('@supabase/ssr', () => ({
    createBrowserClient: vi.fn(() => ({
        auth: {
            getUser: vi.fn(),
            getSession: vi.fn(),
        },
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            insert: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockReturnThis(),
        })),
    })),
    createServerClient: vi.fn(() => ({
        auth: {
            getUser: vi.fn(),
        },
    })),
}))

// Mock Next/Navigation
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn(),
    }),
    usePathname: () => '',
    useSearchParams: () => new URLSearchParams(),
}))

// Mock Contexts if needed
vi.mock('@/contexts/ModalContext', () => ({
    useModal: () => ({
        showSuccess: vi.fn(),
        showError: vi.fn(),
        showConfirm: vi.fn(),
    }),
}))
