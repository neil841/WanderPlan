/**
 * User Seed Data
 *
 * Demo users for development and testing
 */

import bcrypt from "bcrypt";

/**
 * Hash password for demo users
 */
const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10);
};

/**
 * Demo user data
 */
export const getDemoUsers = async () => {
  const hashedPassword = await hashPassword("password123");

  return [
    {
      id: "user-1-demo-admin",
      email: "admin@wanderplan.com",
      password: hashedPassword,
      firstName: "Admin",
      lastName: "User",
      emailVerified: new Date(),
      timezone: "America/New_York",
      settings: {
        notifications: {
          email: {
            tripInvites: true,
            tripUpdates: true,
            messages: true,
            marketing: false,
          },
          push: {
            enabled: false,
          },
        },
        privacy: {
          defaultTripVisibility: "PRIVATE",
          showProfile: true,
        },
        preferences: {
          defaultCurrency: "USD",
          measurementUnit: "metric",
        },
      },
    },
    {
      id: "user-2-demo-traveler",
      email: "traveler@wanderplan.com",
      password: hashedPassword,
      firstName: "Sarah",
      lastName: "Johnson",
      emailVerified: new Date(),
      timezone: "America/Los_Angeles",
      settings: {
        notifications: {
          email: {
            tripInvites: true,
            tripUpdates: true,
            messages: true,
            marketing: true,
          },
          push: {
            enabled: false,
          },
        },
        privacy: {
          defaultTripVisibility: "SHARED",
          showProfile: true,
        },
        preferences: {
          defaultCurrency: "USD",
          measurementUnit: "imperial",
        },
      },
    },
    {
      id: "user-3-demo-agent",
      email: "agent@wanderplan.com",
      password: hashedPassword,
      firstName: "Michael",
      lastName: "Chen",
      emailVerified: new Date(),
      timezone: "America/Chicago",
      bio: "Professional travel agent specializing in luxury travel experiences.",
      settings: {
        notifications: {
          email: {
            tripInvites: true,
            tripUpdates: true,
            messages: true,
            marketing: false,
          },
          push: {
            enabled: false,
          },
        },
        privacy: {
          defaultTripVisibility: "PRIVATE",
          showProfile: true,
        },
        preferences: {
          defaultCurrency: "USD",
          measurementUnit: "metric",
        },
      },
    },
  ];
};
