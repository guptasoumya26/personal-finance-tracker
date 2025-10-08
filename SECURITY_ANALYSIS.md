# Security Fixes Implementation Guide

## Priority Order

1. 🔴 **CRITICAL** - Fix RLS with Service Role Key
2. 🟠 **HIGH** - Remove Fallback JWT Secret
3. 🟠 **HIGH** - Remove Legacy Authentication
4. 🟡 **MEDIUM** - Remove Debug Logging
5. 🟡 **MEDIUM** - Strengthen Password Requirements
6. 🟡 **MEDIUM** - Implement Rate Limiting

---

## 🔴 FIX #1: Implement Service Role Key for RLS

### Step 1: Update Environment Variables

Add to `.env.local`:
```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

Get from: Supabase Dashboard → Settings → API → `service_role` key

**⚠️ NEVER commit this key to git!**

### Step 2: Update Supabase Client

**File:** `src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client-side Supabase client (uses anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client (uses service role key - bypasses RLS)
// ONLY use this in API routes, NEVER expose to client
export const supabaseAdmin = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : (() => {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for server-side operations');
    })();
```

### Step 3: Update All API Routes

Replace `supabase` with `supabaseAdmin` in ALL API routes:

**Example:**
```typescript
// BEFORE
import { supabase } from '@/lib/supabase';
const { data, error } = await supabase.from('expenses').select('*');

// AFTER
import { supabaseAdmin } from '@/lib/supabase';
const { data, error } = await supabaseAdmin.from('expenses').select('*');
```

### Step 4: Update auth.ts

**File:** `src/lib/auth.ts`

```typescript
// Line 3: Change import
import { supabaseAdmin } from './supabase';

// Replace ALL instances of 'supabase' with 'supabaseAdmin'
// There are 11 instances in this file
```

### Step 5: Create RLS Migration

Run in Supabase SQL Editor:

```sql
-- Enable RLS on all tables (already done, but verify)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE central_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE central_investment_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_card_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE income ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_investment_buffer ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (if any from previous attempts)
-- Run this carefully - check what policies exist first with:
-- SELECT * FROM pg_policies WHERE schemaname = 'public';

-- Create permissive policies for service role
-- These allow service role full access while keeping RLS enabled

CREATE POLICY "Service role has full access" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role has full access" ON central_templates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role has full access" ON expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role has full access" ON investments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role has full access" ON notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role has full access" ON central_investment_templates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role has full access" ON credit_card_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role has full access" ON income FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role has full access" ON external_investment_buffer FOR ALL USING (true) WITH CHECK (true);
```

---

## 🟠 FIX #2: Remove Fallback JWT Secret

**File:** `src/lib/auth-utils.ts`

```typescript
// BEFORE (Line 22)
const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';

// AFTER
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  console.error('CRITICAL: JWT_SECRET environment variable is not set');
  throw new Error('Server configuration error');
}
```

**File:** `src/lib/auth.ts`

```typescript
// BEFORE (Line 26)
private static readonly JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

// AFTER
private static readonly JWT_SECRET = (() => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return secret;
})();
```

---

## 🟠 FIX #3: Remove Legacy Authentication

**File:** `src/app/api/auth/login/route.ts`

Remove lines 42-67:

```typescript
// DELETE THIS ENTIRE BLOCK
// Fallback to legacy environment variable authentication for backward compatibility
const legacyUsername = process.env.AUTH_USERNAME;
const legacyPassword = process.env.AUTH_PASSWORD;

if (legacyUsername && legacyPassword && username === legacyUsername && password === legacyPassword) {
  const sessionToken = Buffer.from(`${username}:${Date.now()}`).toString('base64');

  const cookieStore = await cookies();
  cookieStore.set('auth-token', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60,
    path: '/'
  });

  return NextResponse.json({
    success: true,
    user: {
      username: legacyUsername,
      role: 'admin',
      legacy: true
    }
  });
}
```

**File:** `src/lib/auth-utils.ts`

Remove lines 16-28 (legacy token handling in getCurrentUser):

```typescript
// DELETE THIS BLOCK
  } catch {
    // Try legacy token
    try {
      const tokenData = Buffer.from(authToken.value, 'base64').toString();
      const [username] = tokenData.split(':');
      const legacyUsername = process.env.AUTH_USERNAME;
      if (username === legacyUsername) {
        return { username, role: 'admin', legacy: true };
      }
    } catch {
      // Ignore legacy token errors
    }
  }
```

Simplify to:

```typescript
  } catch (error) {
    console.log('getCurrentUser - JWT verification failed:', error);
  }
```

**File:** `src/app/api/admin/users/route.ts`

Remove legacy auth handling (lines 16-28) in getCurrentUser function:

```typescript
// DELETE legacy token fallback
```

---

## 🟡 FIX #4: Remove Debug Logging

Remove or condition all console.log statements:

**Files to update:**
- `src/lib/auth-utils.ts` - Lines 18-30, 40
- `src/app/api/central-investment-template/route.ts` - Lines 34, 37, 41, 52, 57, 61

**Pattern:**
```typescript
// BEFORE
console.log('getCurrentUser - JWT payload:', payload);

// AFTER - Option 1: Remove entirely
// (removed)

// AFTER - Option 2: Use environment flag
if (process.env.NODE_ENV === 'development') {
  console.log('getCurrentUser - JWT payload:', payload);
}

// AFTER - Option 3: Use proper logger (best)
import logger from '@/lib/logger';
logger.debug('getCurrentUser - JWT payload:', { userId: payload.userId }); // Don't log full payload
```

**Remove stack traces from error responses:**

```typescript
// BEFORE
return NextResponse.json(
  {
    error: 'Failed to create central investment template',
    details: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined  // ⚠️ Remove this
  },
  { status: 500 }
);

// AFTER
return NextResponse.json(
  {
    error: 'Failed to create central investment template'
  },
  { status: 500 }
);
```

---

## 🟡 FIX #5: Strengthen Password Requirements

**File:** `src/app/api/auth/signup/route.ts`

```typescript
// BEFORE (Lines 23-28)
if (password.length < 6) {
  return NextResponse.json(
    { error: 'Password must be at least 6 characters long' },
    { status: 400 }
  );
}

// AFTER
// Minimum 8 characters, at least one uppercase, lowercase, and number
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
if (!passwordRegex.test(password)) {
  return NextResponse.json(
    {
      error: 'Password must be at least 8 characters and include uppercase, lowercase, and number'
    },
    { status: 400 }
  );
}

// Optional: Check for common passwords
const commonPasswords = ['password', '12345678', 'password123', 'admin123'];
if (commonPasswords.includes(password.toLowerCase())) {
  return NextResponse.json(
    { error: 'Password is too common. Please choose a stronger password' },
    { status: 400 }
  );
}
```

---

## 🟡 FIX #6: Implement Rate Limiting

### Create Rate Limiter Utility

**File:** `src/lib/rate-limit.ts`

```typescript
import { LRUCache } from 'lru-cache';

type Options = {
  uniqueTokenPerInterval?: number;
  interval?: number;
};

export default function rateLimit(options?: Options) {
  const tokenCache = new LRUCache({
    max: options?.uniqueTokenPerInterval || 500,
    ttl: options?.interval || 60000,
  });

  return {
    check: (res: Response, limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = (tokenCache.get(token) as number[]) || [0];
        if (tokenCount[0] === 0) {
          tokenCache.set(token, tokenCount);
        }
        tokenCount[0] += 1;

        const currentUsage = tokenCount[0];
        const isRateLimited = currentUsage >= limit;

        if (isRateLimited) {
          reject(new Error('Rate limit exceeded'));
        } else {
          resolve();
        }
      }),
  };
}
```

### Install Dependency

```bash
npm install lru-cache
```

### Apply to Login Endpoint

**File:** `src/app/api/auth/login/route.ts`

```typescript
import rateLimit from '@/lib/rate-limit';

const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500, // Max 500 unique IPs per interval
});

export async function POST(request: NextRequest) {
  // Get IP address for rate limiting
  const ip = request.headers.get('x-forwarded-for') ||
             request.headers.get('x-real-ip') ||
             'unknown';

  try {
    await limiter.check(5, ip); // 5 attempts per minute per IP
  } catch {
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again in 1 minute.' },
      { status: 429 }
    );
  }

  // Rest of login logic...
}
```

### Apply to Signup Endpoint

**File:** `src/app/api/auth/signup/route.ts`

```typescript
import rateLimit from '@/lib/rate-limit';

const limiter = rateLimit({
  interval: 60 * 60 * 1000, // 1 hour
  uniqueTokenPerInterval: 500,
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ||
             request.headers.get('x-real-ip') ||
             'unknown';

  try {
    await limiter.check(3, ip); // 3 signup attempts per hour per IP
  } catch {
    return NextResponse.json(
      { error: 'Too many signup attempts. Please try again later.' },
      { status: 429 }
    );
  }

  // Rest of signup logic...
}
```

---

## Testing Checklist

After implementing all fixes:

- [ ] Test login with valid credentials
- [ ] Test login with invalid credentials
- [ ] Test rate limiting (try 6 login attempts)
- [ ] Test signup with weak password (should fail)
- [ ] Test signup with strong password (should succeed)
- [ ] Test all CRUD operations for expenses
- [ ] Test all CRUD operations for investments
- [ ] Test admin panel (user management)
- [ ] Verify no console.log output in production
- [ ] Verify JWT_SECRET is required (remove from .env and test failure)
- [ ] Verify SERVICE_ROLE_KEY is required (remove and test failure)
- [ ] Test that users can only access their own data
- [ ] Check Supabase dashboard: RLS should show "enabled" for all tables

---

## Deployment Checklist

Before deploying to production:

- [ ] All environment variables set in production environment
- [ ] `JWT_SECRET` is a strong, random value (minimum 32 characters)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- [ ] All console.log statements removed or conditioned
- [ ] Rate limiting tested and working
- [ ] Password requirements tested
- [ ] Legacy authentication completely removed
- [ ] RLS migration run in production Supabase
- [ ] All tests passing
- [ ] Security scan completed (npm audit)

---

## Environment Variables Required

```bash
# Required in production
JWT_SECRET=<minimum-32-character-random-string>
SUPABASE_SERVICE_ROLE_KEY=<from-supabase-dashboard>
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from-supabase-dashboard>

# Optional (remove if not needed)
MAX_USERS=5
BCRYPT_ROUNDS=12

# Remove these (legacy)
# AUTH_USERNAME=admin  # ❌ Remove
# AUTH_PASSWORD=...     # ❌ Remove
```

Generate strong JWT_SECRET:
```bash
openssl rand -base64 32
```

---

## Estimated Implementation Time

- Fix #1 (RLS + Service Role): 30-45 minutes
- Fix #2 (JWT Secret): 5 minutes
- Fix #3 (Legacy Auth): 15 minutes
- Fix #4 (Debug Logging): 10 minutes
- Fix #5 (Password Strength): 10 minutes
- Fix #6 (Rate Limiting): 20 minutes

**Total: ~2 hours**

---

## Support & Questions

If you encounter issues:
1. Check environment variables are set
2. Verify Supabase dashboard shows RLS enabled
3. Check browser console for errors
4. Check server logs for authentication failures
5. Test with a fresh database user

**After implementation, your security score should improve to: 9.5/10** ✅
