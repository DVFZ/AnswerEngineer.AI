# AnswerEngineer.AI v1 - Tester Setup Guide 🧪

**Extension Version:** 1.0.0  
**Status:** Ready for Testing  
**Date:** June 22, 2026

---

## 📥 **For Testers: How to Install**

### **Option 1: Load Unpacked (Easiest)**

This is the simplest way to test locally.

#### Steps:

1. **Download & Extract Package**
   - Download: `answeregineer-extension.zip`
   - Extract to folder: `answeregineer-extension/`

2. **Open Chrome**
   - Go to: `chrome://extensions/`

3. **Enable Developer Mode**
   - Toggle "Developer mode" (top right corner)
   - Should show blue toggle

4. **Load Extension**
   - Click "Load unpacked"
   - Select the extracted `answeregineer-extension/` folder
   - Extension installs immediately! ✅

5. **Start Backend Server**
   ```bash
   # In terminal/command prompt:
   cd backend
   node server.js
   ```
   - Should show: `🚀 AnswerEngineer.AI Backend running on port 5000`

6. **Test the Extension**
   - Visit any website
   - Click extension icon (top right)
   - Should see the dark-themed popup! 🎵

---

## ✅ **Testing Checklist**

Print this out and check off as you test:

### **UI & Theme**
- [ ] Extension loads without errors
- [ ] Dark Spotify theme visible
- [ ] Green accent colors throughout
- [ ] All buttons clickable
- [ ] No console errors (F12)

### **Core Features**
- [ ] Enter URL in popup
- [ ] Click "ANALYZE" button
- [ ] Audit results load
- [ ] Score ring displays
- [ ] Tabs work (Point Audit, AI Simulator, etc)

### **Authentication Flow**
- [ ] Click "UPGRADE TO STARTER"
- [ ] Prompted to enter email
- [ ] Email validates correctly
- [ ] Can save email in settings

### **Payment Flow**
- [ ] Click upgrade button
- [ ] Stripe checkout opens
- [ ] Can see payment form
- [ ] Can see pricing details

### **Cancel Payment Test** ⚠️ **CRITICAL**
- [ ] Open Stripe checkout
- [ ] **Close tab WITHOUT paying**
- [ ] Go back to extension
- [ ] Check: Should show "UPGRADE TO STARTER" button
- [ ] Should NOT show "Thank you for being a customer!"
- [ ] Plan should be "Free"

### **Settings Tab**
- [ ] Industry dropdown works
- [ ] Email field editable
- [ ] "Save settings" button works
- [ ] Settings persist on reload

### **Performance**
- [ ] No lag or freezing
- [ ] Popup loads in <1 second
- [ ] Buttons respond immediately
- [ ] Smooth animations

### **Bugs or Issues**
- [ ] No crashes
- [ ] No infinite loops
- [ ] No missing images
- [ ] No broken links

---

## 🐛 **Bug Report Template**

If you find issues, report with:

```
TITLE: [Brief description]

SEVERITY: 
- 🔴 Critical (breaks feature)
- 🟠 Major (significantly impacts use)
- 🟡 Minor (cosmetic or edge case)

STEPS TO REPRODUCE:
1. [Step 1]
2. [Step 2]
3. [Step 3]

EXPECTED:
[What should happen]

ACTUAL:
[What actually happened]

SCREENSHOTS:
[Attach if possible]

ENVIRONMENT:
- OS: Windows / Mac / Linux
- Chrome Version: [version]
- Backend Status: Running / Not running
```

---

## 💡 **Testing Tips**

### **Check Console for Errors**
1. Open extension popup
2. Press `F12` (Developer Tools)
3. Look for red errors
4. Report any errors found

### **Test Multiple Websites**
- Test on: `google.com`, `github.com`, `wikipedia.org`
- Make sure it works everywhere

### **Test All Paths**
- ✅ Upgrade and complete payment
- ✅ Upgrade and cancel payment
- ✅ Switch between tabs
- ✅ Refresh page while popup open

### **Network Issues**
- Disconnect internet → should show error
- Backend offline → should show error
- Reconnect → should recover

---

## 📝 **Feedback Form**

After testing, please fill out:

**What worked well?**
```
[List positive experiences]
```

**What needs improvement?**
```
[List issues or suggestions]
```

**Overall Rating:**
```
⭐⭐⭐⭐⭐ (5 stars = excellent)
```

**Would you use this extension?**
```
Yes / Maybe / No
```

**Any other comments?**
```
[Open feedback]
```

---

## 🆘 **Troubleshooting**

### **Extension doesn't load**
**Problem:** "Load unpacked" button greyed out  
**Solution:** 
- Enable Developer Mode (toggle top right)
- Refresh page (F5)
- Try again

### **Popup is blank/broken**
**Problem:** Extension shows nothing  
**Solution:**
- Check backend is running: `node server.js`
- Check console (F12) for errors
- Reload extension (⟳ button)

### **Backend won't start**
**Problem:** `node server.js` fails  
**Solution:**
```bash
# Check Node is installed:
node --version

# Check dependencies:
cd backend
npm install

# Try starting again:
node server.js
```

### **Can't connect to backend**
**Problem:** "Cannot reach backend"  
**Solution:**
- Make sure backend running on `http://localhost:5000`
- Check no firewall blocking port 5000
- Check file: `chrome-extension/popup.js` line 9 has correct URL

### **Stripe checkout doesn't open**
**Problem:** Clicking upgrade does nothing  
**Solution:**
- Check backend console for errors
- Check browser console (F12) for errors
- Make sure backend running

### **Don't receive magic link email**
**Problem:** No email arrives  
**Solution:**
- Check spam/junk folder
- Check email address typo
- Check backend logs for errors
- Note: Currently sandbox mode (limited emails)

---

## 📊 **Test Report Summary**

After testing, please provide:

```
TESTER NAME: [Your name]
DATE: [Date tested]
OS: Windows / Mac / Linux
CHROME VERSION: [Version]

FEATURES TESTED:
- UI/Theme: ✅✅✅
- Core Analysis: ✅✅✅
- Payment Flow: ⚠️⚠️⚠️ (had issue)
- Overall: ✅✅✅

BUGS FOUND: [Number]
CRITICAL ISSUES: [Number]
SUGGESTIONS: [Number]

READY FOR PRODUCTION: YES / NO / NEEDS FIXES
```

---

## 🎯 **What to Focus On**

Most important tests:
1. **Payment Cancellation** - Verify bug is fixed
2. **Theme** - Does dark Spotify theme look good?
3. **Core Features** - Do analysis & audit work?
4. **Performance** - Is it fast?
5. **Stability** - Any crashes?

---

## ✨ **Thank You for Testing!**

Your feedback helps us ship a quality product. Please report:
- ✅ What works well
- ❌ What breaks
- 💡 What could improve

**Submit feedback to:** contact@digitalventuresfz.com

---

**Happy Testing! 🚀**
