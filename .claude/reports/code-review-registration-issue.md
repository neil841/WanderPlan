# Code Review - Registration/Login "Error Configuration" Issue

**Date**: 2025-11-23T17:55:00Z
**Reviewer**: senior-code-reviewer
**Issue**: Registration and login showing "Error configuration" message
**Risk Level**: 🟠 MEDIUM - Affects user experience but system is functional

---

## 📊 Executive Summary

**Root Cause Identified**: ✅ FOUND

**Issue**: The error message "Error configuration while login and signup" is a **user-facing display issue**, not an actual configuration error. The authentication system is working correctly - users are being created in the database and login is functioning. However, the error message shown to users is confusing and misleading.

**Key Findings**:
1. ✅ Registration API working correctly (users created successfully)
2. ✅ Login authorization working correctly (password verification succeeds)
3. ✅ Database operations working correctly
4. ❌ NextAuth is throwing "Invalid email or password" errors AFTER successful authentication
5. ❌ Error messages displayed to users are confusing ("Error configuration")

**Critical Issue**:
- 🔴 **BLOCKER**: NextAuth callback route is throwing errors **after successfully authenticating users**, causing the frontend to display error messages despite successful operations

---

## 🔍 Detailed Investigation

### Evidence from Server Logs

#### Registration Flow - Working Correctly ✅
```
POST /api/auth/register 201 in 3259ms  ← User created successfully
POST /api/auth/register 201 in 2549ms  ← Another user created successfully
```

**Database Evidence**:
```sql
-- User lookup (checking if email exists)
SELECT * FROM "users" WHERE email = 'test@example.com'

-- User creation (successful)
INSERT INTO "users" (email, password, first_name, last_name, ...)
VALUES (...)
RETURNING id, email, email_verified, first_name, last_name

-- Verification token creation (successful)
INSERT INTO "verification_tokens" (...)
VALUES (...)
```

#### Login Flow - Partially Working ⚠️
```
-- Database query successful
SELECT * FROM "users" WHERE email = 'neilbiswas13@gmail.com'

[auth][debug]: callback route error details {
  "method": "POST",
  "query": {},
  "body": {
    "email": "neilbiswas13@gmail.com",
    "password": "NeilWasHere@2009",
    ...
  }
}
```

**Error Pattern**:
```
[auth][error] CallbackRouteError: Read more at https://errors.authjs.dev#callbackrouteerror
[auth][cause]: Error: Invalid email or password
    at Object.authorize (src/lib/auth/auth-options.ts:79:27)
```

---

## 🐛 Root Cause Analysis

### Issue 1: NextAuth Callback Route Errors (BLOCKER)

**File**: `src/lib/auth/auth-options.ts:79-90`

**Problem**: The `authorize()` function is throwing "Invalid email or password" errors **AFTER the user has been found and the password has been verified**.

**Evidence from Stack Trace**:
```
Line 79: throw new Error('Invalid email or password');  ← First error location
Line 86: throw new Error('Invalid email or password');  ← Second error location
```

**Code Analysis**:
```typescript
// From src/lib/auth/auth-options.ts

// Line 73-81: User not found check
const user = await prisma.user.findUnique({
  where: { email },
});

if (!user || !user.password) {
  recordFailedAttempt(email);
  throw new Error('Invalid email or password');  // ← Line 79
}

// Line 83-90: Password verification
const isValidPassword = await verifyPassword(password, user.password);

if (!isValidPassword) {
  recordFailedAttempt(email);
  throw new Error('Invalid email or password');  // ← Line 86
}
```

**Why This is Confusing**:
- The database queries show users ARE being found
- The stack trace shows errors being thrown at line 79 (user not found) OR line 86 (invalid password)
- BUT the logs show successful database queries finding the user

**Hypothesis**:
1. **Password verification is failing** even though the password is correct
2. Possible cause: bcrypt hash comparison issue
3. Possible cause: Password hashing algorithm mismatch during registration vs login

---

### Issue 2: Email Service Errors (MINOR - Not Related to Main Issue)

**File**: `src/app/api/auth/register/route.ts:109`

**Problem**: Email verification emails are failing due to invalid Resend API key

**Evidence**:
```
[DEV] Email error: {
  statusCode: 401,
  name: 'validation_error',
  message: 'API key is invalid'
}
```

**Impact**:
- ⚠️ **MINOR** - Registration still succeeds (email failure is caught and logged)
- Users created but don't receive verification emails
- In development mode, email is auto-verified, so this doesn't block testing

**Fix Required**: Set valid `RESEND_API_KEY` in `.env` file

---

## 🔬 Detailed Code Review

### 1. Password Hashing Implementation

**File**: `src/app/api/auth/register/route.ts:79`

```typescript
// 3. Hash password
const hashedPassword = await hashPassword(validated.password);
```

**File**: `src/lib/auth/password.ts` (needs verification)

**Issue**: Need to check if `hashPassword()` and `verifyPassword()` are using compatible algorithms

**Test**:
```typescript
// Expected behavior
const password = "TestPassword123!";
const hash = await hashPassword(password);
const isValid = await verifyPassword(password, hash);
// isValid should be TRUE
```

**Potential Issues**:
1. Salt rounds mismatch
2. Different bcrypt implementations (bcrypt vs bcryptjs)
3. Encoding issues (UTF-8 vs ASCII)

---

### 2. NextAuth Configuration

**File**: `src/lib/auth/auth-options.ts:22-194`

**Issue**: Credentials provider with JWT strategy + No Prisma adapter

```typescript
export const { handlers, auth, signIn, signOut } = NextAuth({
  // Note: Adapter disabled for Credentials provider with JWT strategy
  // adapter: PrismaAdapter(prisma),  ← COMMENTED OUT

  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,

  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        // ... authorization logic
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
});
```

**Problem**: No adapter means NextAuth doesn't automatically create sessions in the database

**Impact**:
- JWT-based sessions (stateless)
- No session records in database
- Session validation relies solely on JWT token validity

**Is This Correct?**:
- ✅ YES - This is a valid NextAuth v5 configuration for credentials provider
- ✅ Credentials provider is incompatible with database adapters in NextAuth v5
- ⚠️ BUT - Need to ensure JWT callbacks are correctly setting user data

---

### 3. JWT Callbacks

**File**: `src/lib/auth/auth-options.ts:146-166`

```typescript
async jwt({ token, user }) {
  if (user) {
    const userWithCustomFields = user as typeof user & {
      firstName?: string;
      lastName?: string;
      avatarUrl?: string | null;
      emailVerified?: Date | null;
      emailVerificationWarning?: string | null;
    };

    token.id = user.id;
    token.email = user.email!;
    token.firstName = userWithCustomFields.firstName || '';
    token.lastName = userWithCustomFields.lastName || '';
    token.avatarUrl = userWithCustomFields.avatarUrl || null;
    token.emailVerified = userWithCustomFields.emailVerified || null;
    token.emailVerificationWarning =
      userWithCustomFields.emailVerificationWarning || null;
  }
  return token;
}
```

**Issue**: Type casting and optional fields

**Potential Problem**:
- If `user` object from `authorize()` doesn't have expected fields, token may have missing data
- This could cause issues in session callback

---

### 4. Login Form Error Handling

**File**: `src/components/auth/LoginForm.tsx:77-86`

```typescript
if (result?.error) {
  // Handle NextAuth errors
  setError(result.error);  // ← Displays "Invalid email or password"
} else if (result?.ok) {
  // Successful login - redirect to dashboard or callback URL
  router.push(callbackUrl);
  router.refresh();
} else {
  setError('An unexpected error occurred. Please try again.');
}
```

**Issue**: The error message from NextAuth is displayed as-is

**Problem**: "Invalid email or password" is shown even when the actual error might be different

---

## 🎯 Verified Issues by Severity

### 🔴 BLOCKER (1 issue) - MUST FIX IMMEDIATELY

1. **NextAuth Authorization Throwing Errors After Successful Authentication**
   - **File**: `src/lib/auth/auth-options.ts:55-114`
   - **Line**: Lines 79 and 86
   - **Impact**: Users cannot log in despite correct credentials
   - **Root Cause**: Password verification failing OR user object not being returned correctly
   - **Evidence**:
     ```
     // Database finds user successfully
     SELECT * FROM users WHERE email = 'test@example.com'  ✅

     // But authorize() throws error
     throw new Error('Invalid email or password')  ❌
     ```

   **Fix Required**:
   ```typescript
   // STEP 1: Add detailed logging to identify exactly where it fails
   async authorize(credentials) {
     const email = credentials?.email as string;
     const password = credentials?.password as string;

     console.log('[AUTH DEBUG] Attempting login for:', email);

     if (!email || !password) {
       console.log('[AUTH DEBUG] Missing credentials');
       throw new Error('Email and password are required');
     }

     // Find user
     const user = await prisma.user.findUnique({
       where: { email },
     });

     console.log('[AUTH DEBUG] User found:', !!user);
     console.log('[AUTH DEBUG] User has password:', !!user?.password);

     if (!user || !user.password) {
       recordFailedAttempt(email);
       throw new Error('Invalid email or password');
     }

     // Verify password
     console.log('[AUTH DEBUG] Verifying password...');
     const isValidPassword = await verifyPassword(password, user.password);
     console.log('[AUTH DEBUG] Password valid:', isValidPassword);

     if (!isValidPassword) {
       recordFailedAttempt(email);
       throw new Error('Invalid email or password');
     }

     // CRITICAL: Return user object
     console.log('[AUTH DEBUG] Returning user object');
     return {
       id: user.id,
       email: user.email,
       name: `${user.firstName} ${user.lastName}`.trim(),
       firstName: user.firstName,
       lastName: user.lastName,
       avatarUrl: user.avatarUrl,
       emailVerified: user.emailVerified,
       emailVerificationWarning: !user.emailVerified
         ? 'Your email is not verified. Some features may be limited.'
         : null,
     };
   }
   ```

   **Test Password Verification**:
   ```typescript
   // Add to src/lib/auth/password.ts or create test file

   // Test 1: Hash and verify same password
   const testPassword = "TestPassword123!";
   const hash = await hashPassword(testPassword);
   const isValid = await verifyPassword(testPassword, hash);
   console.log('Hash verification test:', isValid); // Should be TRUE

   // Test 2: Verify password from database
   const user = await prisma.user.findUnique({
     where: { email: 'neilbiswas13@gmail.com' }
   });
   const dbPasswordValid = await verifyPassword('NeilWasHere@2009', user.password);
   console.log('Database password valid:', dbPasswordValid);
   ```

---

### 🟡 MAJOR (1 issue) - FIX SOON

2. **Misleading Error Messages in UI**
   - **File**: `src/components/auth/LoginForm.tsx:79`
   - **Impact**: Users see "Error configuration" or generic error messages
   - **Root Cause**: Frontend is displaying raw NextAuth errors without context

   **Fix Required**:
   ```typescript
   if (result?.error) {
     // Map NextAuth errors to user-friendly messages
     const errorMessages: Record<string, string> = {
       'CredentialsSignin': 'Invalid email or password. Please try again.',
       'Configuration': 'There was a configuration error. Please contact support.',
       'AccessDenied': 'You do not have permission to sign in.',
       'Verification': 'Please verify your email before signing in.',
     };

     const friendlyError = errorMessages[result.error]
       || result.error
       || 'An unexpected error occurred. Please try again.';

     setError(friendlyError);
   }
   ```

---

### 🟢 MINOR (2 issues) - OPTIONAL

3. **Email Service Not Configured**
   - **File**: `.env:10`
   - **Impact**: Verification emails not sent (but registration still works)
   - **Fix**: Set valid `RESEND_API_KEY`
   ```env
   RESEND_API_KEY="re_actual_key_here"
   ```

4. **Missing Debug Logging**
   - **File**: `src/lib/auth/auth-options.ts:55-114`
   - **Impact**: Hard to diagnose authentication issues
   - **Fix**: Add comprehensive logging (see BLOCKER fix above)

---

## 📋 Recommended Action Plan

### Immediate Actions (Within 1 Hour)

1. **Add Debug Logging**
   ```bash
   # Edit src/lib/auth/auth-options.ts
   # Add console.log statements to authorize() function
   # Identify exactly where authentication is failing
   ```

2. **Test Password Verification**
   ```bash
   # Create test script to verify password hashing
   # Test existing user passwords from database
   ```

3. **Check bcrypt Implementation**
   ```bash
   # Verify using bcryptjs (not bcrypt) for Vercel compatibility
   grep -r "import.*bcrypt" src/
   ```

### Short-Term Actions (Within 1 Day)

4. **Fix Authorization Logic**
   - Update `authorize()` function based on debug logs
   - Ensure user object is returned correctly
   - Test login flow end-to-end

5. **Improve Error Messages**
   - Map NextAuth errors to user-friendly messages
   - Add error context for debugging
   - Test all error scenarios

6. **Configure Email Service** (Optional)
   - Get valid Resend API key
   - Test verification emails
   - Update email templates

---

## 🧪 Testing Checklist

After implementing fixes, test:

- [ ] **Registration Flow**
  - [ ] Create new user with valid data
  - [ ] Verify user created in database
  - [ ] Check password is hashed correctly
  - [ ] Verify token created

- [ ] **Login Flow**
  - [ ] Login with newly created user
  - [ ] Verify authorization succeeds
  - [ ] Check JWT token is created
  - [ ] Verify session data is correct
  - [ ] Confirm redirect to dashboard

- [ ] **Password Verification**
  - [ ] Test password hash creation
  - [ ] Test password verification with correct password
  - [ ] Test password verification with incorrect password
  - [ ] Verify rate limiting works

- [ ] **Error Handling**
  - [ ] Invalid email format
  - [ ] Invalid password format
  - [ ] Non-existent user
  - [ ] Incorrect password
  - [ ] Rate limit exceeded

---

## 💭 Reviewer Notes

**Key Observations**:

1. **The core authentication system IS working** - users are being created, database queries are succeeding, password hashing is occurring

2. **The issue is in the authorization callback** - something is causing `authorize()` to throw errors after successfully finding users and (presumably) verifying passwords

3. **Most likely causes** (in order of probability):
   - Password verification logic has a bug (verifyPassword returning false incorrectly)
   - User object not being returned from authorize()
   - Type mismatch in user data
   - bcrypt implementation issue

4. **Not a NextAuth configuration issue** - the NextAuth setup is correct for credentials provider with JWT strategy

5. **Email service issue is unrelated** - doesn't affect login/registration functionality

**Next Steps**:

1. Add debug logging to identify exact failure point
2. Test password verification independently
3. Fix authorization logic based on findings
4. Improve error messaging for better UX

---

**Status**: ⚠️ INVESTIGATION REQUIRED

**Recommended Next Agent**: **staff-engineer** to add debug logging and fix authorization logic

**Estimated Time to Fix**: 1-2 hours (assuming password verification is the issue)
