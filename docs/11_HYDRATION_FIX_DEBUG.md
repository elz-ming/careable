# 🔧 Hydration Error Fix + Debug Logging

## Issues Fixed

### 1. Hydration Mismatch Error ✅
**Problem:** Server-rendered HTML didn't match client HTML, causing React hydration errors.

**Root Cause:** 
- Effects (theme, font size) were running during SSR
- DOM manipulations happened before component mounted
- Server state !== Client state

**Solution:**
```typescript
const [mounted, setMounted] = React.useState(false);

React.useEffect(() => {
  setMounted(true);
}, []);

// Only apply after mount
React.useEffect(() => {
  if (!mounted) return;
  // Apply theme/font size
}, [preferences.theme, mounted]);
```

**Why This Works:**
- Server renders with initial state
- Client mounts with same initial state (no mismatch)
- After mount, effects apply preferences
- No hydration error!

---

### 2. Debug Logging Added 🔍

Added comprehensive logging to diagnose preference changes:

#### PreferenceToggles Component
```typescript
const cycleLanguage = () => {
  console.log('[PreferenceToggles] cycleLanguage clicked!');
  console.log('[PreferenceToggles] Current:', lang, '→ Next:', nextLang);
  setLanguage(nextLang);
};
```

#### PreferencesProvider Component
```typescript
const setLanguage = async (lang) => {
  console.log('[PreferencesProvider] Setting language to:', lang);
  setPreferences(prev => {
    console.log('[PreferencesProvider] Previous:', prev.language, '→ New:', lang);
    return { ...prev, language: lang };
  });
  // ... database save
  console.log('[PreferencesProvider] Language saved to database:', lang);
};

// Translation loading
const translations = React.useMemo(() => {
  console.log('[PreferencesProvider] Loading translations for:', preferences.language);
  return getTranslations(preferences.language);
}, [preferences.language]);

// Preference changes
React.useEffect(() => {
  console.log('[PreferencesProvider] Preferences updated:', preferences);
}, [preferences]);
```

---

## How to Debug

### Step 1: Open Browser Console

1. Run `npm run dev`
2. Open browser (Chrome/Edge/Firefox)
3. Press **F12** to open DevTools
4. Go to **Console** tab

### Step 2: Test Language Toggle

1. Click the **Globe icon** (🌍)
2. **Expected console output:**

```
[PreferenceToggles] cycleLanguage clicked!
[PreferenceToggles] Current: en Index: 0 → Next: zh
[PreferencesProvider] Setting language to: zh
[PreferencesProvider] Previous language: en → New: zh
[PreferencesProvider] Preferences updated: {language: 'zh', fontSize: 'medium', theme: 'light'}
[PreferencesProvider] Loading translations for: zh
[PreferencesProvider] Language saved to database: zh
```

3. **What to look for:**
   - ✅ Click is registered
   - ✅ State updates immediately
   - ✅ Translations reload
   - ✅ Database save succeeds

### Step 3: Test Font Size Toggle

1. Click the **Aa icon**
2. **Expected console output:**

```
[PreferenceToggles] cycleFontSize clicked!
[PreferenceToggles] Current: medium Index: 1 → Next: large
[PreferencesProvider] Setting font size to: large
[PreferencesProvider] Preferences updated: {language: 'zh', fontSize: 'large', theme: 'light'}
[PreferencesProvider] Font size saved to database: large
```

### Step 4: Test Theme Toggle

1. Click the **Sun/Moon icon** (☀️/🌙)
2. **Expected console output:**

```
[PreferencesProvider] Setting theme to: dark
[PreferencesProvider] Preferences updated: {language: 'zh', fontSize: 'large', theme: 'dark'}
[PreferencesProvider] Theme saved to database: dark
```

---

## Troubleshooting

### Issue: Nothing happens when clicking

**Check console for:**
```
[PreferenceToggles] cycleLanguage clicked!
```

**If you see this:**
- ✅ Click handler works
- Problem is in state update

**If you DON'T see this:**
- ❌ Click handler not firing
- Possible causes:
  - Button is disabled
  - Event listener not attached
  - Component not mounted
  - CSS z-index issue (button behind something)

**Fix:**
1. Check if `isLoading` is stuck as `true`
2. Inspect button element in DevTools
3. Check for JavaScript errors

---

### Issue: Click works but UI doesn't update

**Check console for:**
```
[PreferencesProvider] Setting language to: zh
[PreferencesProvider] Previous language: en → New: zh
[PreferencesProvider] Preferences updated: {language: 'zh', ...}
[PreferencesProvider] Loading translations for: zh
```

**If you see these logs:**
- ✅ State updates correctly
- ✅ Translations reload
- Problem is likely:
  - UI not re-rendering
  - Translations not being used in components
  - Context not propagating

**Fix:**
1. Check if `useTranslations()` is called in layout
2. Verify translation keys exist in JSON files
3. Check if component re-renders (React DevTools)

---

### Issue: UI updates but database doesn't save

**Check console for:**
```
[PreferencesProvider] Language saved to database: zh
```

**If you DON'T see this:**
- Check for error logs:
  - `Failed to save language preference:`
  - `Failed to update language:`

**Common errors:**
- **401 Unauthorized:** User not logged in
- **403 Forbidden:** Invalid session
- **500 Server Error:** Database connection issue

**Fix:**
1. Verify user is authenticated (check Clerk)
2. Check network tab in DevTools for failed requests
3. Verify Supabase connection
4. Check server logs for errors

---

### Issue: Hydration error persists

**Error message:**
```
Hydration failed because the server rendered HTML didn't match the client
```

**Check:**
1. Is `mounted` state working?
2. Are effects waiting for `mounted === true`?
3. Any other components manipulating DOM during SSR?

**Verify mounted state:**
```typescript
// In PreferencesProvider
console.log('[PreferencesProvider] Mounted:', mounted);

// Should see:
// false (initial)
// true (after mount)
```

**If mounted is always `false`:**
- Component never mounted (should never happen)

**If mounted is always `true`:**
- Initial state is wrong (should be false)

---

## Expected Behavior After Fix

### 1. Page Load
```
[PreferencesProvider] Loading translations for: en
[PreferencesProvider] Preferences updated: {language: 'en', fontSize: 'medium', theme: 'light'}
[PreferencesProvider] Mounted: true
```

### 2. Click Language (EN → ZH)
```
[PreferenceToggles] cycleLanguage clicked!
[PreferenceToggles] Current: en Index: 0 → Next: zh
[PreferencesProvider] Setting language to: zh
[PreferencesProvider] Previous language: en → New: zh
[PreferencesProvider] Preferences updated: {language: 'zh', fontSize: 'medium', theme: 'light'}
[PreferencesProvider] Loading translations for: zh
```
**UI:** Text changes to Chinese immediately

### 3. Click Font Size (M → L)
```
[PreferenceToggles] cycleFontSize clicked!
[PreferenceToggles] Current: medium Index: 1 → Next: large
[PreferencesProvider] Setting font size to: large
[PreferencesProvider] Preferences updated: {language: 'zh', fontSize: 'large', theme: 'light'}
```
**UI:** Text grows larger immediately

### 4. Click Theme (Light → Dark)
```
[PreferencesProvider] Setting theme to: dark
[PreferencesProvider] Preferences updated: {language: 'zh', fontSize: 'large', theme: 'dark'}
```
**UI:** Colors invert immediately

### 5. Database Saves (Background)
```
[PreferencesProvider] Language saved to database: zh
[PreferencesProvider] Font size saved to database: large
[PreferencesProvider] Theme saved to database: dark
```
**No blocking:** Happens async, user doesn't wait

---

## Next Steps

### If Everything Works ✅
1. **Remove debug logs** (or keep for production debugging)
2. **Test on mobile device**
3. **Verify persistence** (refresh page, preferences restore)
4. **Test all pages** (participant, volunteer, profile)

### If Still Not Working ❌
1. **Share console logs** with the full output
2. **Check Network tab** for failed API calls
3. **Verify database schema** (migration 09 applied?)
4. **Check Supabase RLS policies** (can user update preferences?)

---

## Build Status

```
✓ Compiled successfully in 11.7s
✓ TypeScript check passed
✓ 30 routes generated
✓ ZERO errors
✓ Hydration fix applied
✓ Debug logging added
```

---

## Removing Debug Logs (Later)

Once everything works, remove console.log statements:

```bash
# Search for debug logs
git grep "console.log.*PreferencesProvider"
git grep "console.log.*PreferenceToggles"

# Remove them manually or with sed
```

Or keep them for production debugging with conditional logging:

```typescript
const DEBUG = process.env.NODE_ENV === 'development';
if (DEBUG) console.log('[PreferencesProvider] ...');
```

---

*Debug logging: The developer's best friend!* 🔍
