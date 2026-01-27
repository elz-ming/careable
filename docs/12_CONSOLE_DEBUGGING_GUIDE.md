# 🔍 Console Debugging Guide

## ⚠️ IMPORTANT: Where to Find Console Logs

### ❌ WRONG: Command Prompt/Terminal
```
C:\Users\elzzh\GitLocal\careable> npm run dev

> careable@0.1.0 dev
> next dev

  ▲ Next.js 16.1.4
  - Local: http://localhost:3000

 ✓ Starting...
 ✓ Ready in 2.3s
```
**❌ Client-side console.log() will NOT appear here!**

This terminal only shows:
- Server startup messages
- Build errors
- Server-side logs (from Server Components/Actions)

---

### ✅ CORRECT: Browser Console

**Steps to open:**

1. **Open your browser** (Chrome, Edge, Firefox, Safari)
2. **Go to** http://localhost:3000
3. **Press F12** (or Ctrl+Shift+I on Windows, Cmd+Option+I on Mac)
4. **Click the "Console" tab**

**Alternative ways to open:**
- Right-click anywhere → "Inspect" → "Console" tab
- Chrome menu → More Tools → Developer Tools → Console
- Edge menu → More tools → Developer tools → Console

---

## What You Should See

### 1. When Page Loads

In the **browser console**, you should see:

```javascript
[PreferenceToggles] Component mounted!
[PreferenceToggles] Initial preferences: {language: 'en', fontSize: 'medium', theme: 'light'}
[PreferenceToggles] isLoading: false
[PreferencesProvider] Loading translations for: en
[PreferencesProvider] Preferences updated: {language: 'en', fontSize: 'medium', theme: 'light'}
```

**If you DON'T see this:**
- Component didn't render → Check if you're on /volunteer or /participant page
- JavaScript error → Look for red error messages in console

---

### 2. When You Click Language Button (🌍)

You should see:

1. **An alert popup:** "🌍 Language button clicked! Check browser console (F12) for logs."
2. **In the console:**
   ```javascript
   [PreferenceToggles] cycleLanguage clicked!
   [PreferenceToggles] Current: en Index: 0 → Next: zh
   [PreferencesProvider] Setting language to: zh
   [PreferencesProvider] Previous language: en → New: zh
   [PreferencesProvider] Preferences updated: {language: 'zh', fontSize: 'medium', theme: 'light'}
   [PreferencesProvider] Loading translations for: zh
   [PreferencesProvider] Language saved to database: zh
   ```

**If you see the alert but no console logs:**
- You're looking at the wrong console (check browser, not terminal)
- Console might be filtered (make sure "All levels" is selected)

**If you DON'T see the alert:**
- Button click isn't working
- Button might be disabled (`isLoading` is true)
- Button might be covered by another element
- JavaScript error preventing execution

---

## Troubleshooting

### Issue: "I don't see any browser console"

**Solution:**

**Chrome/Edge:**
1. Click the three dots menu (⋮) in top right
2. More tools → Developer tools
3. Click "Console" tab at the top

**Firefox:**
1. Click the hamburger menu (☰) in top right
2. More tools → Web Developer Tools
3. Click "Console" tab

**Safari:**
1. Safari menu → Settings → Advanced
2. Enable "Show Develop menu in menu bar"
3. Develop → Show JavaScript Console

---

### Issue: "Console is empty"

**Check:**
1. Are you on the correct page? (http://localhost:3000/volunteer/dashboard)
2. Did the page load successfully?
3. Is console filter set to "All levels"? (not "Errors" or "Warnings" only)
4. Clear console (🚫 icon) and reload page (F5)

**Look for:**
- Red error messages (JavaScript errors)
- Yellow warnings (might indicate issues)
- Blue/gray info messages (normal logs)

---

### Issue: "I see errors in red"

**Common errors:**

**Error: Failed to load preferences**
- Database connection issue
- User not authenticated
- Check Network tab for failed API calls

**Error: usePreferences must be used within PreferencesProvider**
- Context provider not wrapping component
- Should be fixed by template.tsx files

**Error: Translation key not found**
- Missing translation in JSON files
- Check locales/en.json, locales/zh.json, locales/ms.json

---

### Issue: "Console says 'Paused in debugger'"

**Solution:**
1. Click the **Play/Resume** button (▶️) in DevTools
2. Or press **F8** to continue
3. You might have accidentally set a breakpoint

---

### Issue: "Too many logs, can't find mine"

**Solution:**
1. **Clear console:** Click 🚫 icon (or Ctrl+L / Cmd+K)
2. **Filter logs:** Type `[Preference` in the filter box at top
3. **Preserve log:** Enable "Preserve log" checkbox (keeps logs across page reloads)

---

## Testing Checklist

### ✅ Step-by-Step Test

1. **Open browser** to http://localhost:3000/volunteer/dashboard
2. **Open DevTools** (F12)
3. **Click Console tab**
4. **Clear console** (🚫 icon)
5. **Reload page** (F5)
6. **Verify logs:** Should see `[PreferenceToggles] Component mounted!`
7. **Click globe icon** (🌍)
8. **Verify alert:** Should see popup message
9. **Click OK** on alert
10. **Check console:** Should see all the preference change logs
11. **Check UI:** Text should change to Chinese

---

## Screenshots Guide

### Where Browser Console Is Located

**Chrome/Edge:**
```
┌──────────────────────────────────────┐
│  Browser Window                      │
│                                      │
│  Your website content here           │
│                                      │
├──────────────────────────────────────┤ <- F12 opens this
│  Elements | Console | Sources | ...  │ <- Click Console
├──────────────────────────────────────┤
│  > [PreferenceToggles] Component ... │ <- Logs appear here
│  > [PreferencesProvider] Loading ... │
│  > console.log output                │
│                                      │
└──────────────────────────────────────┘
```

---

## What Happens in Each Location

### Terminal/Command Prompt (npm run dev)
```
Server logs:
✓ Compiled successfully
✓ Ready in 2.3s
GET /volunteer/dashboard 200 in 45ms
POST /api/preferences/language 200 in 12ms
```
**Shows:** Server-side activity only

### Browser Console (F12)
```
Client logs:
[PreferenceToggles] Component mounted!
[PreferencesProvider] Setting language to: zh
console.log('Hello from browser')
```
**Shows:** Client-side JavaScript activity

### Network Tab (F12 → Network)
```
API calls:
GET /volunteer/dashboard    200  OK
POST /api/preferences/language  200  OK
GET /locales/zh.json       200  OK
```
**Shows:** HTTP requests and responses

---

## Quick Reference

| What | Where | How |
|------|-------|-----|
| Client logs (`console.log`) | Browser Console | F12 → Console |
| Server logs | Terminal | Where you ran `npm run dev` |
| API calls | Browser Network tab | F12 → Network |
| DOM structure | Browser Elements tab | F12 → Elements |
| React components | React DevTools | F12 → React |

---

## Next Steps

### If Alert Shows Up ✅
- **Great!** Button is working
- **Now check browser console** (F12 → Console)
- You should see all the detailed logs
- Share those logs if language isn't changing

### If NO Alert Shows Up ❌
- Button click not working
- Check browser console for JavaScript errors
- Check if button is visible (not covered by other elements)
- Check if `isLoading` is stuck as `true`

---

## Getting Help

If still not working, share:

1. **Screenshot of browser console** (F12 → Console)
2. **Screenshot of Network tab** (F12 → Network, filter: "preference")
3. **Any red error messages**
4. **Browser and version** (Chrome 120, Edge 120, etc.)
5. **Does the alert show up?** (Yes/No)

---

*Remember: Browser console for client logs, terminal for server logs!* 🎯
