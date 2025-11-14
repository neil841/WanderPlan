/**
 * User Types
 *
 * Type definitions for user entities
 */

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

export interface UserProfile extends User {
  bio: string | null;
  phone: string | null;
  timezone: string;
  emailVerified: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
