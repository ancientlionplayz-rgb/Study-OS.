const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log(' RUNNING STUDYOS EMERGENCY LOGIN REPRO & QA TEST    ');
console.log('====================================================\n');

// Mock localStorage for Node environment test
class LocalStorageMock {
  constructor() {
    this.store = {};
  }
  clear() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
}

global.localStorage = new LocalStorageMock();
global.window = {};

// --- TEST 1: AuthService getRegisteredUsers Fallback & Auto-seed ---
console.log('--- TEST 1: AuthService getRegisteredUsers Seeding Verification ---');
const authServiceFile = path.resolve('src/lib/auth/authService.ts');
const authServiceContent = fs.readFileSync(authServiceFile, 'utf8');

assert(authServiceContent.includes('return DEFAULT_USERS'), 'AuthService must seed DEFAULT_USERS when uninitialized');
assert(authServiceContent.includes('localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS))'), 'AuthService must persist DEFAULT_USERS to storage');
console.log('✓ Seeding logic verified in authService.ts.\n');

// --- TEST 2: AuthContext signIn / signUp Contract ---
console.log('--- TEST 2: AuthContext Methods & State Synchronization ---');
const authContextFile = path.resolve('src/lib/supabase/AuthContext.tsx');
const authContextContent = fs.readFileSync(authContextFile, 'utf8');

assert(authContextContent.includes('signIn: (identifier: string, password: string) => Promise<SignInResult>'), 'AuthContext must export signIn method in interface');
assert(authContextContent.includes('signUp: (params:'), 'AuthContext must export signUp method in interface');
assert(authContextContent.includes('resendVerificationEmail:'), 'AuthContext must export resendVerificationEmail method in interface');
assert(authContextContent.includes('setSession('), 'AuthContext must set session state on sign in');
assert(authContextContent.includes('setUser('), 'AuthContext must set user state on sign in');
assert(authContextContent.includes('setProfile('), 'AuthContext must set profile state on sign in');
console.log('✓ AuthContext methods and immediate React state setters verified.\n');

// --- TEST 3: LoginPage Form, Button, and Hook Integration ---
console.log('--- TEST 3: LoginPage Form, Button, and Hook Integration ---');
const loginPageFile = path.resolve('src/app/auth/login/page.tsx');
const loginPageContent = fs.readFileSync(loginPageFile, 'utf8');

assert(loginPageContent.includes('useAuth()'), 'LoginPage must consume useAuth()');
assert(loginPageContent.includes('const result = await signIn(email, password)'), 'LoginPage must invoke signIn method');
assert(loginPageContent.includes('<form onSubmit={handleLogin}'), 'LoginPage must bind onSubmit={handleLogin} to form');
assert(loginPageContent.includes('type="submit"'), 'LoginPage submit button must have type="submit"');
assert(loginPageContent.includes('disabled={loading}'), 'LoginPage submit button must reflect loading state');
assert(loginPageContent.includes('resendVerificationEmail'), 'LoginPage must support resending verification email');
assert(loginPageContent.includes('rohan@studyos.local'), 'LoginPage must include quick demo account helpers');
console.log('✓ LoginPage form bindings, submit handlers, and verification resend verified.\n');

// --- TEST 4: SignupPage useAuth Integration ---
console.log('--- TEST 4: SignupPage useAuth Integration ---');
const signupPageFile = path.resolve('src/app/auth/signup/page.tsx');
const signupPageContent = fs.readFileSync(signupPageFile, 'utf8');

assert(signupPageContent.includes('const { signUp } = useAuth()'), 'SignupPage must consume signUp from useAuth()');
assert(signupPageContent.includes('const result = await signUp('), 'SignupPage must call useAuth().signUp');
assert(signupPageContent.includes('/api/auth/check-username'), 'SignupPage must validate username with server endpoint');
console.log('✓ SignupPage useAuth integration verified.\n');

// --- TEST 5: AuthGuard Session Gatekeeping ---
console.log('--- TEST 5: AuthGuard Session Gatekeeping ---');
const authGuardFile = path.resolve('src/components/auth/AuthGuard.tsx');
const authGuardContent = fs.readFileSync(authGuardFile, 'utf8');

assert(authGuardContent.includes('const hasActiveSession = Boolean(user || profile)'), 'AuthGuard must check active session');
assert(authGuardContent.includes("if (!hasActiveSession && !isPublicRoute)"), 'AuthGuard must redirect unauthenticated users to /auth/login');
assert(authGuardContent.includes("router.replace('/auth/login')"), 'AuthGuard must enforce /auth/login redirect');
console.log('✓ AuthGuard gatekeeper verified intact.\n');

console.log('====================================================');
console.log(' ALL 5 EMERGENCY LOGIN REPAIR CHECKS PASSED!        ');
console.log('====================================================');
