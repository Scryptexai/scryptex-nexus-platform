
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import speakeasy from 'speakeasy'
import { AdminUser, AuthSession, MFASetup } from '@/types/admin.types'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET_KEY || 'fallback-secret-key')
const SESSION_DURATION = parseInt(process.env.SESSION_MAX_DURATION || '14400000') // 4 hours
const REFRESH_INTERVAL = parseInt(process.env.SESSION_REFRESH_INTERVAL || '900000') // 15 minutes

// Mock admin users - In production, this should be from a secure database
const ADMIN_USERS: Record<string, AdminUser> = {
  'admin': {
    id: '1',
    username: 'admin',
    email: 'admin@scryptex.io',
    role: 'super_admin',
    permissions: [{ resource: '*', actions: ['read', 'write', 'delete', 'control'] }],
    lastLogin: new Date(),
    mfaEnabled: true,
    ipWhitelist: [],
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  }
}

// Mock MFA secrets - In production, store securely encrypted
const MFA_SECRETS: Record<string, string> = {
  'admin': 'JBSWY3DPEHPK3PXP' // This should be encrypted in production
}

// Session storage - In production, use Redis or secure database
const ACTIVE_SESSIONS = new Map<string, AuthSession>()

export class AdminAuthService {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12)
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }

  static async generateMFASecret(username: string): Promise<MFASetup> {
    const secret = speakeasy.generateSecret({
      name: `SCRYPTEX Admin (${username})`,
      issuer: process.env.MFA_ISSUER || 'SCRYPTEX_ADMIN',
      length: 32
    })

    const backupCodes = Array.from({ length: 8 }, () => 
      Math.random().toString(36).substring(2, 10).toUpperCase()
    )

    // Store the secret securely (encrypted in production)
    MFA_SECRETS[username] = secret.base32

    return {
      secret: secret.base32,
      qrCode: secret.otpauth_url || '',
      backupCodes
    }
  }

  static verifyMFAToken(username: string, token: string): boolean {
    const secret = MFA_SECRETS[username]
    if (!secret) return false

    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2 // Allow 2 time steps tolerance
    })
  }

  static async createSession(user: AdminUser, ipAddress: string, userAgent: string): Promise<string> {
    const sessionId = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + SESSION_DURATION)

    const session: AuthSession = {
      user,
      token: sessionId,
      expiresAt,
      mfaVerified: false,
      ipAddress,
      userAgent
    }

    // Store session
    ACTIVE_SESSIONS.set(sessionId, session)

    // Create JWT token
    const token = await new SignJWT({ 
      sessionId, 
      userId: user.id, 
      username: user.username,
      role: user.role 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(expiresAt)
      .sign(JWT_SECRET)

    return token
  }

  static async verifySession(token: string): Promise<AuthSession | null> {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      const sessionId = payload.sessionId as string

      const session = ACTIVE_SESSIONS.get(sessionId)
      if (!session) return null

      // Check if session is expired
      if (session.expiresAt < new Date()) {
        ACTIVE_SESSIONS.delete(sessionId)
        return null
      }

      return session
    } catch (error) {
      return null
    }
  }

  static async updateMFAVerification(token: string): Promise<void> {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      const sessionId = payload.sessionId as string

      const session = ACTIVE_SESSIONS.get(sessionId)
      if (session) {
        session.mfaVerified = true
        ACTIVE_SESSIONS.set(sessionId, session)
      }
    } catch (error) {
      console.error('Failed to update MFA verification:', error)
    }
  }

  static async revokeSession(token: string): Promise<void> {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      const sessionId = payload.sessionId as string
      ACTIVE_SESSIONS.delete(sessionId)
    } catch (error) {
      console.error('Failed to revoke session:', error)
    }
  }

  static async revokeAllUserSessions(userId: string): Promise<void> {
    for (const [sessionId, session] of ACTIVE_SESSIONS.entries()) {
      if (session.user.id === userId) {
        ACTIVE_SESSIONS.delete(sessionId)
      }
    }
  }

  static getActiveSessions(): AuthSession[] {
    return Array.from(ACTIVE_SESSIONS.values())
  }

  static cleanExpiredSessions(): void {
    const now = new Date()
    for (const [sessionId, session] of ACTIVE_SESSIONS.entries()) {
      if (session.expiresAt < now) {
        ACTIVE_SESSIONS.delete(sessionId)
      }
    }
  }

  static async login(username: string, password: string): Promise<AdminUser | null> {
    const user = ADMIN_USERS[username]
    if (!user || !user.isActive) return null

    // In production, verify password against hashed password from database
    // For demo purposes, accepting any password for 'admin' user
    if (username === 'admin') {
      user.lastLogin = new Date()
      return user
    }

    return null
  }

  static getUser(username: string): AdminUser | null {
    return ADMIN_USERS[username] || null
  }

  static hasPermission(user: AdminUser, resource: string, action: string): boolean {
    if (user.role === 'super_admin') return true

    return user.permissions.some(permission => 
      (permission.resource === '*' || permission.resource === resource) &&
      permission.actions.includes(action as any)
    )
  }
}

// Utility functions for Next.js
export async function getSession(): Promise<AuthSession | null> {
  const cookieStore = cookies()
  const token = cookieStore.get('admin-session')?.value

  if (!token) return null

  return AdminAuthService.verifySession(token)
}

export async function requireAuth(): Promise<AuthSession> {
  const session = await getSession()
  if (!session) {
    throw new Error('Authentication required')
  }
  return session
}

export async function requireMFA(): Promise<AuthSession> {
  const session = await requireAuth()
  if (!session.mfaVerified) {
    throw new Error('MFA verification required')
  }
  return session
}

export async function requirePermission(resource: string, action: string): Promise<AuthSession> {
  const session = await requireMFA()
  if (!AdminAuthService.hasPermission(session.user, resource, action)) {
    throw new Error('Insufficient permissions')
  }
  return session
}

// Clean up expired sessions periodically
setInterval(() => {
  AdminAuthService.cleanExpiredSessions()
}, 60000) // Every minute
