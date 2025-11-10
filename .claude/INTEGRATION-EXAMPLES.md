# Agentic System - Integration Examples

This guide shows real-world examples of how agents work together to build complete features.

---

## Example 1: Building User Authentication (Complete Workflow)

This example shows the entire agentic workflow from idea to deployment for a user authentication feature.

### Step 1: Project Initialization

```bash
User: /start-project
```

**Interactive Session**:
```
System: What is your app called?
User: TravelPlanner

System: What is the core problem this app solves?
User: Helps users plan trips with friends by sharing itineraries and splitting costs

System: Who will use this app?
User: Travelers aged 25-45 who take group trips (friends, family)

System: What features do you want?
User: User accounts, Trip planning, Expense tracking, Itinerary sharing, Budget calculator

System: Any specific tech requirements?
User: Need mobile responsive, Stripe for payments

✅ Project Initialized: TravelPlanner
```

**What Happens**:
- Creates `.claude/context/project-state.json` with initial state
- Creates `.claude/specs/project-brief.md` with user input
- Sets currentPhase to "phase-0-planning"
- Sets all Phase 0 tasks to "pending"

---

### Step 2: Product Strategy Analysis

```bash
User: /orchestrate
```

**Agent**: `product-strategy-advisor`

**What It Does**:
1. Reads `project-brief.md`
2. Analyzes requested features
3. Identifies missing critical features:
   - ✅ User accounts (requested)
   - ❌ Password reset (MISSING - adds)
   - ❌ Email verification (MISSING - adds)
   - ❌ Social login (MISSING - suggests)
   - ❌ User profile (MISSING - adds)
   - ❌ Settings page (MISSING - adds)
   - ❌ 404/500 error pages (MISSING - adds)

**Output**: `.claude/specs/project-idea.md`

```markdown
# TravelPlanner - Product Specification

## Approved Features

### CRITICAL (Must Have)
1. **User Authentication System**
   - User registration with email/password
   - Email verification flow
   - Login/logout functionality
   - Password reset flow
   - Session management

2. **User Profile Management**
   - View/edit profile
   - Profile picture upload
   - Account settings

... (more features)

## User Personas

### Primary Persona: Sarah (Trip Organizer)
- Age: 32, Marketing Manager
- Tech savvy, plans 3-4 group trips/year
- Pain point: Coordinating with friends via scattered WhatsApp messages
- Needs: Central place to plan, share, track expenses

... (more personas)
```

**User Reviews**: Approves all suggested features

**State Update**:
```json
{
  "phases": {
    "phase-0-planning": {
      "tasks": {
        "task-0-product-strategy": "completed"
      }
    }
  }
}
```

---

### Step 3: API Contract Design

```bash
User: /orchestrate
```

**Agent**: `api-contract-designer`

**What It Does**:
1. Reads approved `project-idea.md`
2. Designs REST API endpoints for all features
3. Creates OpenAPI 3.0 specification

**Output**: `.claude/specs/api-specs.yaml`

```yaml
openapi: 3.0.0
info:
  title: TravelPlanner API
  version: 1.0.0

paths:
  /api/auth/register:
    post:
      summary: Register new user
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required: [email, password, name]
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
                  minLength: 8
                name:
                  type: string
                  minLength: 2
      responses:
        '201':
          description: User created
          content:
            application/json:
              schema:
                type: object
                properties:
                  id: { type: string }
                  email: { type: string }
                  name: { type: string }
                  emailVerified: { type: boolean }
        '400':
          description: Validation error
        '409':
          description: Email already exists

  /api/auth/login:
    post:
      summary: Login user
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required: [email, password]
              properties:
                email: { type: string }
                password: { type: string }
      responses:
        '200':
          description: Login successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  token: { type: string }
                  user: { $ref: '#/components/schemas/User' }
        '401':
          description: Invalid credentials

  ... (30+ more endpoints)

components:
  schemas:
    User:
      type: object
      properties:
        id: { type: string }
        email: { type: string }
        name: { type: string }
        avatar: { type: string, nullable: true }
        emailVerified: { type: boolean }
        createdAt: { type: string, format: date-time }
```

---

### Step 4: Database Design

```bash
User: /orchestrate
```

**Agent**: `database-designer`

**What It Does**:
1. Reads `api-specs.yaml`
2. Reads `project-idea.md`
3. Designs database schema with Prisma

**Output**: `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                String    @id @default(cuid())
  email             String    @unique
  emailVerified     Boolean   @default(false)
  verificationToken String?   @unique
  name              String
  password          String    // Hashed with bcrypt
  avatar            String?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  // Relations
  trips             Trip[]
  expenses          Expense[]
  sessions          Session[]

  @@index([email])
  @@map("users")
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([token])
  @@map("sessions")
}

model Trip {
  id          String   @id @default(cuid())
  name        String
  description String?
  startDate   DateTime
  endDate     DateTime
  budget      Decimal  @db.Decimal(10, 2)
  ownerId     String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  owner  User      @relation(fields: [ownerId], references: [id])
  expenses Expense[]

  @@index([ownerId])
  @@map("trips")
}

model Expense {
  id          String   @id @default(cuid())
  description String
  amount      Decimal  @db.Decimal(10, 2)
  category    String
  date        DateTime @default(now())
  tripId      String
  paidById    String
  createdAt   DateTime @default(now())

  trip   Trip @relation(fields: [tripId], references: [id], onDelete: Cascade)
  paidBy User @relation(fields: [paidById], references: [id])

  @@index([tripId])
  @@index([paidById])
  @@map("expenses")
}
```

---

### Step 5: System Architecture & Task Breakdown

```bash
User: /orchestrate
```

**Agent**: `system-architect`

**What It Does**:
1. Validates all Phase 0 outputs are consistent
2. Defines tech stack
3. Creates phased implementation plan
4. Breaks features into specific tasks

**Output**: `.claude/specs/implementation-tasks.md`

```markdown
# Implementation Tasks - TravelPlanner

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript (strict mode)
- Tailwind CSS + shadcn/ui
- Framer Motion (animations)
- TanStack Query (data fetching)
- Zod (validation)

### Backend
- Next.js API Routes
- Prisma ORM
- PostgreSQL
- JWT authentication
- bcrypt (password hashing)

### Testing
- Jest + React Testing Library
- Playwright (E2E)
- >80% code coverage

---

## Phase 1: Core Authentication (3 tasks)

### Task 1.1: User Registration & Email Verification

**ID**: `task-1-register`
**Complexity**: Medium (M)
**Estimated Time**: 3-4 hours
**Dependencies**: None

**Acceptance Criteria**:
1. User can register with email/password
2. Password must be 8+ characters
3. Email verification token sent after registration
4. User cannot login until email verified
5. Email verification link works correctly
6. Registration form has proper validation
7. Duplicate email shows clear error
8. Password is hashed with bcrypt (cost 10)

**Files to Create**:
- `src/app/api/auth/register/route.ts`
- `src/app/api/auth/verify-email/route.ts`
- `src/app/(auth)/register/page.tsx`
- `src/lib/auth/register-service.ts`
- `src/lib/validations/auth.ts`
- `src/__tests__/auth/register.test.ts`

**API Endpoints**:
- POST `/api/auth/register`
- GET `/api/auth/verify-email?token=xxx`

**UI Components**:
- RegisterForm (shadcn/ui Form + Card)
- EmailVerificationPending screen
- EmailVerified success screen

---

### Task 1.2: User Login & Session Management

**ID**: `task-1-login`
**Complexity**: Medium (M)
**Estimated Time**: 2-3 hours
**Dependencies**: task-1-register

**Acceptance Criteria**:
1. User can login with verified email/password
2. Unverified email shows specific error
3. Invalid credentials show generic error (security)
4. JWT token created on successful login
5. Token stored in httpOnly cookie
6. Token expires after 7 days
7. Login form has validation
8. "Remember me" option extends token to 30 days

**Files to Create**:
- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/logout/route.ts`
- `src/app/api/auth/me/route.ts`
- `src/app/(auth)/login/page.tsx`
- `src/lib/auth/session-service.ts`
- `src/middleware.ts` (protect routes)
- `src/__tests__/auth/login.test.ts`

---

### Task 1.3: Password Reset Flow

**ID**: `task-1-password-reset`
**Complexity**: Medium (M)
**Estimated Time**: 2-3 hours
**Dependencies**: task-1-login

**Acceptance Criteria**:
1. User can request password reset
2. Reset token sent to email (expires in 1 hour)
3. Reset link works correctly
4. User can set new password
5. Old password no longer works after reset
6. Token single-use only
7. Expired token shows clear error

**Files to Create**:
- `src/app/api/auth/forgot-password/route.ts`
- `src/app/api/auth/reset-password/route.ts`
- `src/app/(auth)/forgot-password/page.tsx`
- `src/app/(auth)/reset-password/page.tsx`
- `src/__tests__/auth/password-reset.test.ts`

---

## Phase 2: User Profile & Settings (2 tasks)

### Task 2.1: User Profile Management
... (similar detail)

### Task 2.2: Account Settings
... (similar detail)

---

## Phase 3: Trip Planning (5 tasks)
... (detailed tasks)

## Phase 4: Expense Tracking (4 tasks)
... (detailed tasks)

## Phase 5: Budget Calculator (3 tasks)
... (detailed tasks)
```

**Phase 0 Complete!** Ready for implementation.

---

### Step 6: Implement Task 1.1 (User Registration)

```bash
User: /orchestrate
```

**Agent**: `staff-engineer`

**What It Does**:

1. **Reads Context**:
   - `implementation-tasks.md` → Gets Task 1.1 details
   - `api-specs.yaml` → Knows /api/auth/register contract
   - `schema.prisma` → Knows User model structure

2. **Calls Premium UX Designer** for UI:
   ```
   Task({
     subagent_type: "premium-ux-designer",
     prompt: "Design a registration form with:
       - Email input (with validation)
       - Password input (show/hide toggle)
       - Name input
       - Submit button with loading state
       - Link to login page
       - Use shadcn/ui Card, Form, Input components
       - Make it accessible (WCAG 2.1 AA)
       - Add animations with Framer Motion"
   })
   ```

3. **Premium UX Designer** returns component

4. **Staff Engineer Implements**:

**File**: `src/app/(auth)/register/page.tsx`
```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { registerSchema } from "@/lib/validations/auth";
import Link from "next/link";

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  });

  async function onSubmit(data: RegisterFormData) {
    try {
      setIsSubmitting(true);
      setError(null);

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Registration failed");
      }

      // Success - redirect to email verification pending
      router.push("/verify-email-pending");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Create Account</CardTitle>
            <CardDescription>
              Start planning trips with friends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Creating account..." : "Sign up"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
```

**File**: `src/lib/validations/auth.ts`
```typescript
import * as z from "zod";

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain uppercase letter")
    .regex(/[a-z]/, "Password must contain lowercase letter")
    .regex(/[0-9]/, "Password must contain number"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
```

**File**: `src/app/api/auth/register/route.ts`
```typescript
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { registerSchema } from "@/lib/validations/auth";
import { sendVerificationEmail } from "@/lib/email";
import { generateVerificationToken } from "@/lib/auth/tokens";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Generate verification token
    const verificationToken = generateVerificationToken();

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        name: validatedData.name,
        password: hashedPassword,
        verificationToken,
        emailVerified: false,
      },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    // Send verification email (async, don't await)
    sendVerificationEmail(user.email, verificationToken).catch((err) => {
      console.error("Failed to send verification email:", err);
      // Don't fail registration if email fails
    });

    return NextResponse.json(
      {
        message: "User created. Please check your email to verify your account.",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }

    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
```

**File**: `src/__tests__/auth/register.test.ts`
```typescript
import { POST } from "@/app/api/auth/register/route";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

// Mock dependencies
jest.mock("@/lib/db");
jest.mock("@/lib/email");

describe("POST /api/auth/register", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should register a new user successfully", async () => {
    const mockUser = {
      id: "user-1",
      email: "test@example.com",
      name: "Test User",
      emailVerified: false,
      createdAt: new Date(),
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

    const request = new Request("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "Password123",
        name: "Test User",
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.user.email).toBe("test@example.com");
    expect(data.message).toContain("verify");
  });

  it("should return 409 if email already exists", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: "existing-user",
      email: "test@example.com",
    });

    const request = new Request("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "Password123",
        name: "Test User",
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.message).toContain("already registered");
  });

  it("should return 400 for invalid password", async () => {
    const request = new Request("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "weak",
        name: "Test User",
      }),
    });

    const response = await POST(request as any);
    expect(response.status).toBe(400);
  });
});
```

5. **Staff Engineer validates with Chrome DevTools**:
   - Opens `http://localhost:3000/register`
   - Tests form submission
   - Validates error states
   - Checks accessibility
   - Takes screenshots

6. **Completes Task**:
   - Updates `project-state.json`: `task-1-register: "completed"`
   - Writes to `agent-handoffs.md`
   - Releases lock

---

### Step 7: QA Testing Agent Tests the Code

```bash
User: /orchestrate
```

**Agent**: `qa-testing-agent`

**What It Does**:
1. Runs existing tests: `npm run test`
2. Checks coverage: >80% required
3. Runs E2E tests with Playwright
4. Generates test report

**Output**: All tests pass ✅

---

### Step 8: Senior Code Reviewer Reviews

```bash
User: /orchestrate
```

**Agent**: `senior-code-reviewer`

**What It Does**:
1. Reviews code quality
2. Checks security (password hashing, SQL injection)
3. Validates accessibility
4. Checks performance

**Findings**:
- ✅ Code quality: Good
- ✅ Security: bcrypt used correctly
- ✅ Tests: 85% coverage
- ✅ Accessibility: WCAG 2.1 AA compliant
- ⚠️  Suggestion: Add rate limiting to prevent abuse

**Creates**: `.claude/reports/code-review-task-1-register.md`

---

### Step 9: Git Workflow Agent Commits

```bash
User: /orchestrate
```

**Agent**: `git-workflow-agent`

**What It Does**:
1. Creates semantic commit
2. Pushes to git

**Commit**:
```
feat(auth): implement user registration with email verification

- Add POST /api/auth/register endpoint
- Add POST /api/auth/verify-email endpoint
- Create registration UI with shadcn/ui components
- Implement bcrypt password hashing
- Add Zod validation schemas
- Write unit tests (85% coverage)
- Add Playwright E2E tests

Closes #1

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

---

### Steps 10-30: Repeat for All Tasks

The system continues this loop:
1. `/orchestrate` → staff-engineer implements
2. `/orchestrate` → qa-testing-agent tests
3. `/orchestrate` → senior-code-reviewer reviews
4. `/orchestrate` → git-workflow-agent commits
5. Repeat for next task

---

### Final Steps: Enhancement Agents

After core features complete:

```bash
User: /orchestrate
```

**Agents run in sequence**:
1. `code-refactorer` - Cleans up complex code
2. `accessibility-compliance-agent` - Runs axe-core audits
3. `performance-monitoring-agent` - Checks Core Web Vitals
4. `security-agent` - Runs OWASP Top 10 audit
5. `technical-documentation-agent` - Generates README, API docs
6. `devops-agent` - Sets up CI/CD, Docker

---

## Complete Feature Output

After all agents complete, the project has:

**Files Created**: ~50 files
- 12 API routes
- 15 UI pages/components
- 8 service modules
- 10 test files
- 5 docs

**Code Quality**:
- ✅ 100% TypeScript
- ✅ 85%+ test coverage
- ✅ WCAG 2.1 AA accessible
- ✅ Core Web Vitals: All green
- ✅ Zero security vulnerabilities
- ✅ Fully documented

**Git History**: 20 semantic commits

**Ready for**: Production deployment

---

This example shows how the agentic system turns an idea into production-ready code through systematic, quality-focused automation! 🚀
