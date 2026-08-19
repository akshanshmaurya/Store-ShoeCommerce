/**
 * Canonical Customer Identity & Authentication Types
 * Phase 3 — Customer Authentication & Account Foundation
 * Aligned with AGENTS.md & docs/domain-model.md
 */

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';

export interface CustomerAddress {
  id: string;
  name: string;
  phone?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface CustomerProfile {
  firstName: string;
  lastName: string;
  phone?: string;
  preferredSizeSystem?: 'US' | 'UK' | 'EU';
  preferredSizeValue?: string;
  marketingOptIn: boolean;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profile: CustomerProfile;
  status: UserStatus;
  createdAt: string; // ISO 8601 UTC
  updatedAt: string; // ISO 8601 UTC
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: string; // ISO 8601 UTC
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  marketingOptIn?: boolean;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
  error?: string;
}
