import { describe, it, expect, beforeEach, vi, Mock } from 'vitest'
import { signup, login, verifyJwt, signJwt } from '../auth'

// Mock the database
vi.mock('../../server', () => ({
  db: {
    data: {
      users: []
    },
    write: vi.fn()
  }
}))

describe('Authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('signup', () => {
    it('should reject invalid username - too short', async () => {
      const result = await signup({ username: 'ab', password: 'ValidPass123!' })
      expect(result).toBeNull()
    })

    it('should reject invalid username - too long', async () => {
      const result = await signup({ 
        username: 'a'.repeat(51), 
        password: 'ValidPass123!' 
      })
      expect(result).toBeNull()
    })

    it('should reject invalid username - special characters', async () => {
      const result = await signup({ 
        username: 'user@domain.com', 
        password: 'ValidPass123!' 
      })
      expect(result).toBeNull()
    })

    it('should reject weak password', async () => {
      const result = await signup({ 
        username: 'validuser', 
        password: 'weak' 
      })
      expect(result).toBeNull()
    })

    it('should accept valid credentials', async () => {
      const result = await signup({ 
        username: 'validuser', 
        password: 'ValidPass123!' 
      })
      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('username', 'validuser')
      expect(result).not.toHaveProperty('password')
    })
  })

  describe('login', () => {
    it('should reject empty credentials', async () => {
      const result = await login({ username: '', password: '' })
      expect(result).toBeNull()
    })

    it('should reject non-string credentials', async () => {
      const result = await login({ username: 123 as any, password: 'password' })
      expect(result).toBeNull()
    })

    it('should reject overly long credentials', async () => {
      const result = await login({ 
        username: 'a'.repeat(256), 
        password: 'password' 
      })
      expect(result).toBeNull()
    })
  })

  describe('JWT operations', () => {
    it('should create and verify valid JWT', async () => {
      const payload = { id: 'test-user-id' }
      const token = await signJwt(payload)
      expect(token).toBeTruthy()
      
      const verified = await verifyJwt(token)
      expect(verified).toHaveProperty('sub', 'test-user-id')
    })

    it('should reject invalid JWT', async () => {
      const result = await verifyJwt('invalid-token')
      expect(result).toBeNull()
    })
  })
})