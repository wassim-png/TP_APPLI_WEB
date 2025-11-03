import type { TokenPayload } from './token-payload.js'

declare global {
  namespace Express {
    interface Request {
      cookies?: Record<string, string>
      user?: TokenPayload
    }
  }
}

export {}