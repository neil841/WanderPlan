/**
 * Landing Page Type Definitions
 *
 * TypeScript types for landing pages and leads.
 */

/**
 * Block types supported in landing pages
 */
export type LandingPageBlockType =
  | 'hero'
  | 'text'
  | 'features'
  | 'gallery'
  | 'lead-capture'
  | 'pricing';

/**
 * Landing page content block
 */
export interface LandingPageBlock {
  id: string;
  type: LandingPageBlockType;
  data: Record<string, any>;
}

/**
 * Landing page content structure
 */
export interface LandingPageContent {
  blocks: LandingPageBlock[];
}

/**
 * Basic trip information for landing page
 */
export interface TripBasic {
  id: string;
  name: string;
  startDate: Date | null;
  endDate: Date | null;
  destinations: string[];
}

/**
 * Landing page model
 */
export interface LandingPage {
  id: string;
  slug: string;
  userId: string;
  tripId: string | null;
  title: string;
  description: string | null;
  content: LandingPageContent;
  isPublished: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  trip?: TripBasic | null;
}

/**
 * Request body for creating a landing page
 */
export interface CreateLandingPageRequest {
  slug: string;
  tripId?: string;
  title: string;
  description?: string;
  content: LandingPageContent;
  isPublished?: boolean;
}

/**
 * Request body for updating a landing page
 */
export interface UpdateLandingPageRequest {
  slug?: string;
  title?: string;
  description?: string;
  content?: LandingPageContent;
  isPublished?: boolean;
}

/**
 * Lead model
 */
export interface Lead {
  id: string;
  landingPageId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  message: string | null;
  createdAt: Date;
}

/**
 * Request body for capturing a lead
 */
export interface CreateLeadRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  message?: string;
}

/**
 * API response for landing page list
 */
export interface LandingPageListResponse {
  success: boolean;
  data: {
    landingPages: LandingPage[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

/**
 * API response for single landing page
 */
export interface LandingPageResponse {
  success: boolean;
  data: LandingPage;
}

/**
 * API response for lead creation
 */
export interface LeadResponse {
  success: boolean;
  message: string;
}
