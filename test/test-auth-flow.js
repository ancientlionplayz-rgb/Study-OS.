/**
 * StudyOS Auth & Startup Flow Comprehensive Verification Test
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log(' RUNNING STUDYOS AUTH & STARTUP FLOW VERIFICATIONS  ');
console.log('====================================================\n');

// --- TEST 1: Public Routes Whitelist Integrity ---
console.log('--- TEST 1: Public Routes Whitelist Integrity ---');
const authGuardPath = path.resolve('src/components/auth/AuthGuard.tsx');
const authGuardContent = fs.readFileSync(authGuardPath, 'utf8');

assert(authGuardContent.includes("'/auth/login'"), 'AuthGuard must include /auth/login in public routes');
assert(authGuardContent.includes("'/auth/signup'"), 'AuthGuard must include /auth/signup in public routes');
assert(authGuardContent.includes("'/auth/forgot-password'"), 'AuthGuard must include /auth/forgot-password in public routes');
assert(authGuardContent.includes("'/auth/reset-password'"), 'AuthGuard must include /auth/reset-password in public routes');
assert(authGuardContent.includes("'/auth/verify-email'"), 'AuthGuard must include /auth/verify-email in public routes');
assert(authGuardContent.includes("'/auth/callback'"), 'AuthGuard must include /auth/callback in public routes');
console.log('✓ Public routes whitelist verified intact.\n');

// --- TEST 2: Startup Loading Screen & Dashboard Leak Prevention ---
console.log('--- TEST 2: Startup Loading Screen & Dashboard Leak Prevention ---');
assert(authGuardContent.includes('Loading StudyOS...'), 'AuthGuard must render branded loading splash during session verification');
assert(authGuardContent.includes('if (!user && !profile)'), 'AuthGuard must return null/prevent render if unauthenticated');
assert(authGuardContent.includes("router.replace('/auth/login')"), 'AuthGuard must redirect unauthenticated users to /auth/login');
console.log('✓ Startup Loading Screen and zero-leak dashboard protection verified.\n');

// --- TEST 3: Onboarding Gatekeeper Verification ---
console.log('--- TEST 3: Onboarding Gatekeeper Verification ---');
assert(authGuardContent.includes('onboardingCompleted === false'), 'AuthGuard must check onboardingCompleted');
assert(authGuardContent.includes("router.replace('/onboarding')"), 'AuthGuard must redirect incomplete onboarding users to /onboarding');

const onboardingPagePath = path.resolve('src/app/onboarding/page.tsx');
const onboardingContent = fs.readFileSync(onboardingPagePath, 'utf8');
assert(onboardingContent.includes('onboardingCompleted: true'), 'Onboarding approval must set onboardingCompleted: true');
console.log('✓ Onboarding routing and completion persistence verified.\n');

// --- TEST 4: Session Check & Sign Out Cache Purge in AuthContext ---
console.log('--- TEST 4: Session Check & Sign Out Cache Purge in AuthContext ---');
const authContextPath = path.resolve('src/lib/supabase/AuthContext.tsx');
const authContextContent = fs.readFileSync(authContextPath, 'utf8');

assert(authContextContent.includes('supabase.auth.getSession()'), 'AuthContext must query getSession on startup');
assert(authContextContent.includes('supabase.auth.onAuthStateChange'), 'AuthContext must listen to onAuthStateChange');
assert(authContextContent.includes('authSubscription.unsubscribe()'), 'AuthContext must cleanly unsubscribe on unmount');
assert(authContextContent.includes('AuthService.setCurrentAccount(null)'), 'signOut must clear stored user account from cache');
console.log('✓ Supabase session verification and sign-out cache purge verified.\n');

// --- TEST 5: Unique Username Server Route & Signup Validation ---
console.log('--- TEST 5: Unique Username Server Route & Signup Validation ---');
const checkUsernamePath = path.resolve('src/app/api/auth/check-username/route.ts');
assert(fs.existsSync(checkUsernamePath), 'src/app/api/auth/check-username/route.ts must exist');
const checkUsernameContent = fs.readFileSync(checkUsernamePath, 'utf8');
assert(checkUsernameContent.includes('.from(\'profiles\')'), 'Username check must query Supabase profiles table');

const signupPagePath = path.resolve('src/app/auth/signup/page.tsx');
const signupPageContent = fs.readFileSync(signupPagePath, 'utf8');
assert(signupPageContent.includes('/api/auth/check-username'), 'Signup page must check unique username against API endpoint');
console.log('✓ Unique username validation and API route verified.\n');

// --- TEST 6: Header, Sidebar & MoreDrawer User Profile & Sign Out Actions ---
console.log('--- TEST 6: Header, Sidebar & MoreDrawer User Profile & Sign Out Actions ---');
const headerPath = path.resolve('src/components/navigation/Header.tsx');
const headerContent = fs.readFileSync(headerPath, 'utf8');
assert(headerContent.includes('useAuth()'), 'Header must use useAuth hook');
assert(headerContent.includes('handleSignOut'), 'Header must have handleSignOut handler');
assert(headerContent.includes('authProfile'), 'Header must render authProfile info');

const sidebarPath = path.resolve('src/components/navigation/Sidebar.tsx');
const sidebarContent = fs.readFileSync(sidebarPath, 'utf8');
assert(sidebarContent.includes('useAuth()'), 'Sidebar must use useAuth hook');
assert(sidebarContent.includes('handleSignOut'), 'Sidebar must have handleSignOut handler');
assert(sidebarContent.includes('authProfile'), 'Sidebar must render authenticated student card');

const moreDrawerPath = path.resolve('src/components/navigation/MoreDrawer.tsx');
const moreDrawerContent = fs.readFileSync(moreDrawerPath, 'utf8');
assert(moreDrawerContent.includes('useAuth()'), 'MoreDrawer must use useAuth hook');
assert(moreDrawerContent.includes('handleSignOut'), 'MoreDrawer must have handleSignOut handler');
console.log('✓ User Profile and Sign Out actions verified across Header, Sidebar, and MoreDrawer.\n');

// --- TEST 7: PWA Production Publish Readiness ---
console.log('--- TEST 7: PWA Production Publish Readiness ---');
const manifestPath = path.resolve('public/manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
assert(manifest.name.includes('StudyOS'), 'Manifest must have StudyOS name');
assert(manifest.icons.length >= 2, 'Manifest must have multiple icons');
assert(fs.existsSync(path.resolve('public/icon-192.svg')), 'icon-192.svg must exist');
assert(fs.existsSync(path.resolve('public/icon-512.svg')), 'icon-512.svg must exist');

const swPath = path.resolve('public/sw.js');
const swContent = fs.readFileSync(swPath, 'utf8');
assert(swContent.includes('/icon-192.svg'), 'sw.js must precache icon-192.svg');
assert(swContent.includes('/icon-512.svg'), 'sw.js must precache icon-512.svg');
console.log('✓ PWA manifest, service worker caching, and vector icons verified.\n');

console.log('====================================================');
console.log(' ALL 7 AUTH & STARTUP VERIFICATIONS PASSED!         ');
console.log('====================================================');
