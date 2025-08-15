import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/preact'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from '../useAuth'

// Mock jwt-decode
vi.mock('jwt-decode', () => ({
  jwtDecode: vi.fn(() => ({
    sub: 'test-user-id',
    exp: Date.now() / 1000 + 3600 // 1 hour from now
  }))
}))

// Mock TanStack Router
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn()
}))

// Mock tRPC
vi.mock('../../trpc', () => ({
  trpc: {
    login: {
      useMutation: () => ({
        mutateAsync: vi.fn().mockResolvedValue({ token: 'mock-jwt-token' })
      })
    },
    signup: {
      useMutation: () => ({
        mutateAsync: vi.fn().mockResolvedValue({ id: 'user-id', username: 'testuser' })
      })
    }
  }
}))

// Test component to access auth context
function TestComponent() {
  const { user, isLoading } = useAuth()
  
  return (
    <div>
      <div data-testid=\"loading\">{isLoading ? 'loading' : 'not loading'}</div>
      <div data-testid=\"user\">{user ? user.username : 'no user'}</div>
    </div>
  )
}

function renderWithProviders(component: any) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })
  
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {component}
      </AuthProvider>
    </QueryClientProvider>
  )
}

describe('useAuth', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('should initialize with no user and loading false', async () => {
    renderWithProviders(<TestComponent />)
    
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not loading')
      expect(screen.getByTestId('user')).toHaveTextContent('no user')
    })
  })

  it('should load user from localStorage if token exists', async () => {
    localStorage.setItem('authToken', 'valid-token')
    localStorage.setItem('userData', JSON.stringify({ id: 'test-user-id', username: 'testuser' }))
    
    renderWithProviders(<TestComponent />)
    
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('testuser')
    })
  })

  it('should clear invalid token from localStorage', async () => {
    localStorage.setItem('authToken', 'invalid-token')
    localStorage.setItem('userData', JSON.stringify({ id: 'wrong-id', username: 'testuser' }))
    
    // Mock jwt-decode to return different user ID
    const { jwtDecode } = await import('jwt-decode')
    vi.mocked(jwtDecode).mockReturnValueOnce({ sub: 'different-id', exp: Date.now() / 1000 + 3600 })
    
    renderWithProviders(<TestComponent />)
    
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('no user')
      expect(localStorage.getItem('authToken')).toBeNull()
      expect(localStorage.getItem('userData')).toBeNull()
    })
  })
})