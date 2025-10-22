import {
  validateEmail,
  validatePassword,
  sanitizeInput,
  validateFileSize,
  validateFileType,
  userRegistrationSchema,
  userLoginSchema,
  snippetCreateSchema,
  profileUpdateSchema,
} from '@/lib/validations'

describe('Validation Functions', () => {
  describe('validateEmail', () => {
    test('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true)
      expect(validateEmail('valid.email@subdomain.domain.com')).toBe(true)
    })

    test('should reject invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
      expect(validateEmail('@domain.com')).toBe(false)
      expect(validateEmail('test..email@domain.com')).toBe(false)
    })
  })

  describe('validatePassword', () => {
    test('should validate strong passwords', () => {
      expect(validatePassword('StrongPass123!')).toBe(true)
      expect(validatePassword('MyP@ssw0rd')).toBe(true)
      expect(validatePassword('Complex1Pass!')).toBe(true)
    })

    test('should reject weak passwords', () => {
      expect(validatePassword('weak')).toBe(false)
      expect(validatePassword('password')).toBe(false)
      expect(validatePassword('12345678')).toBe(false)
      expect(validatePassword('onlylowercase')).toBe(false)
      expect(validatePassword('ONLYUPPERCASE')).toBe(false)
    })
  })

  describe('sanitizeInput', () => {
    test('should remove HTML tags and trim whitespace', () => {
      expect(sanitizeInput('  <script>alert("xss")</script>  ')).toBe('alert("xss")')
      expect(sanitizeInput('<h1>Title</h1>')).toBe('Title')
      expect(sanitizeInput('  normal text  ')).toBe('normal text')
    })
  })

  describe('validateFileSize', () => {
    test('should validate file sizes correctly', () => {
      const smallFile = { size: 1024 } // 1KB
      const largeFile = { size: 10 * 1024 * 1024 } // 10MB

      expect(validateFileSize(smallFile, 5 * 1024 * 1024)).toBe(true)
      expect(validateFileSize(largeFile, 5 * 1024 * 1024)).toBe(false)
    })
  })

  describe('validateFileType', () => {
    test('should validate allowed file types', () => {
      const imageFile = { type: 'image/jpeg' }
      const textFile = { type: 'text/plain' }
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']

      expect(validateFileType(imageFile, allowedTypes)).toBe(true)
      expect(validateFileType(textFile, allowedTypes)).toBe(false)
    })
  })
})

describe('Schema Validations', () => {
  describe('userRegistrationSchema', () => {
    test('should validate correct registration data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'StrongPass123!',
        confirmPassword: 'StrongPass123!'
      }

      const result = userRegistrationSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    test('should reject invalid registration data', () => {
      const invalidData = {
        name: 'J', // Too short
        email: 'invalid-email',
        password: 'weak',
        confirmPassword: 'different'
      }

      const result = userRegistrationSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      expect(result.error.issues).toHaveLength(4)
    })

    test('should reject mismatched passwords', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'StrongPass123!',
        confirmPassword: 'DifferentPass123!'
      }

      const result = userRegistrationSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      expect(result.error.issues.some(issue => issue.message === "Passwords don't match")).toBe(true)
    })
  })

  describe('userLoginSchema', () => {
    test('should validate correct login data', () => {
      const validData = {
        email: 'john@example.com',
        password: 'password123'
      }

      const result = userLoginSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    test('should reject invalid login data', () => {
      const invalidData = {
        email: 'invalid-email',
        password: ''
      }

      const result = userLoginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('snippetCreateSchema', () => {
    test('should validate correct snippet data', () => {
      const validData = {
        title: 'My Code Snippet',
        description: 'A useful function',
        code: 'function hello() { return "Hello World"; }',
        language: 'javascript',
        tags: ['utility', 'function'],
        isPublic: true
      }

      const result = snippetCreateSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    test('should reject invalid snippet data', () => {
      const invalidData = {
        title: 'A', // Too short
        description: '',
        code: '',
        language: 'invalid-language',
        tags: ['a'.repeat(50)], // Tag too long
        isPublic: 'not-boolean'
      }

      const result = snippetCreateSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    test('should limit number of tags', () => {
      const tooManyTags = Array(15).fill('tag') // More than max allowed

      const invalidData = {
        title: 'Valid Title',
        description: 'Valid description',
        code: 'console.log("hello")',
        language: 'javascript',
        tags: tooManyTags,
        isPublic: true
      }

      const result = snippetCreateSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('profileUpdateSchema', () => {
    test('should validate correct profile data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        bio: 'Software developer with 5 years of experience',
        location: 'San Francisco, CA',
        website: 'https://johndoe.dev',
        github: 'johndoe',
        linkedin: 'john-doe',
        twitter: 'johndoe',
        skills: ['JavaScript', 'React', 'Node.js']
      }

      const result = profileUpdateSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    test('should reject invalid profile data', () => {
      const invalidData = {
        name: 'J',
        email: 'invalid-email',
        bio: 'a'.repeat(600), // Too long
        website: 'not-a-url',
        skills: Array(25).fill('skill') // Too many skills
      }

      const result = profileUpdateSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    test('should allow empty optional fields', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        bio: '',
        website: '',
        skills: []
      }

      const result = profileUpdateSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })
})