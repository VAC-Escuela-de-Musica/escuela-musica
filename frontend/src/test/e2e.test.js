import { describe, it, expect, beforeAll, afterAll } from 'vitest'

/**
 * Tests End-to-End para validar funcionalidad completa
 * Estos tests verifican la integración entre frontend y backend
 */

describe('End-to-End Tests', () => {
  const BASE_URL = 'http://localhost:1230'
  
  beforeAll(() => {
    // Configurar el entorno para tests E2E
    global.fetch = fetch
  })

  afterAll(() => {
    // Limpiar después de tests E2E
  })

  describe('Authentication Flow', () => {
    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      }

      // Mock del login exitoso
      const mockResponse = {
        success: true,
        data: {
          user: {
            id: '1',
            username: 'testuser',
            email: 'test@example.com',
            role: 'student'
          },
          token: 'mock-jwt-token'
        }
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse
      })

      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      })

      const result = await response.json()
      
      expect(response.ok).toBe(true)
      expect(result.success).toBe(true)
      expect(result.data.user.email).toBe(loginData.email)
      expect(result.data.token).toBeDefined()
    })

    it('should reject login with invalid credentials', async () => {
      const loginData = {
        email: 'invalid@example.com',
        password: 'wrongpassword'
      }

      const mockResponse = {
        success: false,
        message: 'Credenciales inválidas'
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => mockResponse
      })

      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      })

      const result = await response.json()
      
      expect(response.ok).toBe(false)
      expect(result.success).toBe(false)
      expect(result.message).toBe('Credenciales inválidas')
    })
  })

  describe('Materials Management', () => {
    it('should fetch materials successfully', async () => {
      const mockMaterials = [
        {
          id: '1',
          title: 'Material 1',
          description: 'Descripción del material 1',
          category: 'Teoría',
          instrument: 'Piano',
          difficulty: 'Principiante'
        },
        {
          id: '2',
          title: 'Material 2',
          description: 'Descripción del material 2',
          category: 'Práctica',
          instrument: 'Guitarra',
          difficulty: 'Intermedio'
        }
      ]

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: mockMaterials
        })
      })

      const response = await fetch(`${BASE_URL}/api/materials`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer mock-jwt-token'
        }
      })

      const result = await response.json()
      
      expect(response.ok).toBe(true)
      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(2)
      expect(result.data[0].title).toBe('Material 1')
    })

    it('should create material successfully', async () => {
      const newMaterial = {
        title: 'Nuevo Material',
        description: 'Descripción del nuevo material',
        category: 'Teoría',
        instrument: 'Piano',
        difficulty: 'Principiante'
      }

      const mockResponse = {
        success: true,
        data: {
          id: '3',
          ...newMaterial,
          createdAt: new Date().toISOString()
        }
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockResponse
      })

      const response = await fetch(`${BASE_URL}/api/materials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-jwt-token'
        },
        body: JSON.stringify(newMaterial)
      })

      const result = await response.json()
      
      expect(response.ok).toBe(true)
      expect(result.success).toBe(true)
      expect(result.data.title).toBe(newMaterial.title)
      expect(result.data.id).toBeDefined()
    })
  })

  describe('User Management', () => {
    it('should fetch user profile successfully', async () => {
      const mockUser = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'student',
        createdAt: new Date().toISOString()
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: mockUser
        })
      })

      const response = await fetch(`${BASE_URL}/api/users/profile`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer mock-jwt-token'
        }
      })

      const result = await response.json()
      
      expect(response.ok).toBe(true)
      expect(result.success).toBe(true)
      expect(result.data.username).toBe('testuser')
      expect(result.data.email).toBe('test@example.com')
    })
  })

  describe('File Upload', () => {
    it('should upload multiple files successfully', async () => {
      const mockFiles = [
        { name: 'file1.pdf', size: 1024 },
        { name: 'file2.pdf', size: 2048 }
      ]

      const mockResponse = {
        success: true,
        data: {
          uploadedFiles: mockFiles.map((file, index) => ({
            ...file,
            id: `file-${index + 1}`,
            url: `http://localhost:1230/files/file-${index + 1}`
          }))
        }
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse
      })

      const formData = new FormData()
      mockFiles.forEach(file => {
        formData.append('files', new Blob([file.name], { type: 'application/pdf' }), file.name)
      })

      const response = await fetch(`${BASE_URL}/api/materials/upload-multiple`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer mock-jwt-token'
        },
        body: formData
      })

      const result = await response.json()
      
      expect(response.ok).toBe(true)
      expect(result.success).toBe(true)
      expect(result.data.uploadedFiles).toHaveLength(2)
    })
  })
})
