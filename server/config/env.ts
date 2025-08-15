import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters long for security')
    .max(512, 'JWT_SECRET is too long'),
  PORT: z
    .string()
    .regex(/^\d+$/, 'PORT must be a number')
    .transform(Number)
    .refine(port => port > 0 && port < 65536, 'PORT must be between 1 and 65535')
    .default(9000),
  ROOT_DIR: z
    .string()
    .min(1, 'ROOT_DIR cannot be empty')
    .default('./uploads/'),
  CORS_ORIGIN: z
    .string()
    .url('CORS_ORIGIN must be a valid URL')
    .default('http://localhost:5173'),
  LOG_LEVEL: z
    .enum(['error', 'warn', 'info', 'debug'])
    .default('info'),
  DATABASE_FILE: z
    .string()
    .min(1, 'DATABASE_FILE cannot be empty')
    .default('db.json'),
})

export type EnvConfig = z.infer<typeof envSchema>

let config: EnvConfig

export function validateEnv(): EnvConfig {
  try {
    config = envSchema.parse(process.env)
    
    // Additional validation
    if (config.NODE_ENV === 'production') {
      // In production, JWT_SECRET should be even stronger
      if (config.JWT_SECRET.length < 64) {
        throw new Error('In production, JWT_SECRET should be at least 64 characters long')
      }
      
      // Check for default/weak secrets
      if (config.JWT_SECRET.includes('your-secret-key') || 
          config.JWT_SECRET === '12345678901234567890123456789012') {
        throw new Error('JWT_SECRET appears to be a default value. Use a strong, random secret in production')
      }
    }
    
    return config
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map(err => `${err.path.join('.')}: ${err.message}`)
      throw new Error(`Environment validation failed:\n${errorMessages.join('\n')}`)
    }
    throw error
  }
}

export function getConfig(): EnvConfig {
  if (!config) {
    throw new Error('Environment not validated. Call validateEnv() first.')
  }
  return config
}