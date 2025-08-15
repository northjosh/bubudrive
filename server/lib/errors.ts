import { TRPCError } from '@trpc/server'

export class AppError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor)
    
    this.name = this.constructor.name
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400)
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401)
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403)
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404)
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409)
  }
}

// Convert app errors to tRPC errors
export function toTRPCError(error: unknown): TRPCError {
  if (error instanceof AppError) {
    let code: TRPCError['code'] = 'INTERNAL_SERVER_ERROR'
    
    switch (error.statusCode) {
      case 400:
        code = 'BAD_REQUEST'
        break
      case 401:
        code = 'UNAUTHORIZED'
        break
      case 403:
        code = 'FORBIDDEN'
        break
      case 404:
        code = 'NOT_FOUND'
        break
      case 409:
        code = 'CONFLICT'
        break
    }
    
    return new TRPCError({
      code,
      message: error.message
    })
  }
  
  if (error instanceof Error) {
    return new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: error.message
    })
  }
  
  return new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred'
  })
}

// Error handler middleware for Express
export function errorHandler(error: unknown, req: any, res: any, next: any) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    })
  }
  
  if (error instanceof Error) {
    console.error('Unexpected error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { 
        message: error.message,
        stack: error.stack 
      })
    })
  }
  
  console.error('Unknown error:', error)
  return res.status(500).json({
    error: 'Internal server error'
  })
}