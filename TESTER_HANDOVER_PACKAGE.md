# Tester Handover Package - AnswerEngineer.AI v1.0 MVP

**Date:** June 28, 2026  
**Version:** 1.0 - Multi-Domain Subscriptions  
**Type:** MVP Release

---

## Complete Handover Checklist

### 📋 DOCUMENTATION (Must Include)

Share these 4 files with the tester:

```
📁 Documentation/
├── MVP_TESTING_SUMMARY.md          ⭐ START HERE
├── TESTER_GUIDE.md                 📖 Detailed instructions
├── TESTING_CHECKLIST.md            ✅ Sign-off sheet
└── RELEASE_NOTES.md                📝 Technical details
```

**How to share:** ZIP these 4 files or send as individual files

---

### 💻 EXTENSION CODE (Must Include)

```
📁 chrome-extension/
├── manifest.json
├── popup.html
├── popup.css
├── popup.js                        ⭐ MAIN FILE (recently updated)
├── icons/
│   ├── icon-16.png
│   ├── icon-48.png
│   ├── icon-128.png
│   └── icon-256.png
└── [other supporting files]
```

**How to provide:**
- ✅ ZIP the entire `chrome-extension/` folder
- ✅ OR provide GitHub repo link
- ✅ Include clear instructions for loading in Chrome (see TESTER_GUIDE.md)

**Important:** Ensure tester has latest version with all recent fixes:
- ✅ Email validation fixes
- ✅ Multi-domain isolation fixes
- ✅ Magic link verification fixes
- ✅ Cross-domain bleed fixes

---

### 🔧 BACKEND INFORMATION (Must Include)

Provide testers with:

**Backend URL:**
```
https://answerengineer-ai.onrender.com
```

**Health Check:**
```
curl https://answerengineer-ai.onrender.com/health
→ Expected response: {"status": "ok"}
```

**API Endpoints** (for reference):
- `POST /api/checkout-session` - Create Stripe session
- `POST /api/magic-link` - Send verification email
- `GET /api/verify/:token` - Verify magic link
- `GET /api/subscription/:email/:domain` - Check subscription status
- `POST /api/reset-to-free` - Reset to FREE plan

**Database Info:**
- Supabase project (provide read-only access if needed)
- Table: `domain_subscriptions`
- Verification: Testers can check if subscriptions are created correctly

**Important:** ✅ Ensure backend is deployed BEFORE testers start

---

### 💳 TEST CREDENTIALS (Must Provide)

**Test Stripe Card** (for testing payments):
```
Card Number:  4242 4242 4242 4242
Expiry:       12/25 (any future date)
CVC:          123 (any 3 digits)
ZIP:          12345 (any 5 digits)

These are Stripe TEST cards - they won't charge real money
```

**Test Email Accounts:**
```
Provide testers with 2-3 test email addresses:
- Example: tester1@gmail.com
- Example: tester2@gmail.com
- Example: tester3@gmail.com

These should be accounts the testers can access to receive magic links
```

**Test Domains:**
```
If testers need to test on real domains, provide 2-3:
- Domain A: https://www.domain-a.com/
- Domain B: https://www.domain-b.com/
- Domain C: https://www.domain-c.com/

OR: Testers can use any domains they have access to
```

---

### 📁 Directory Structure to Provide

```
AnswerEngineer.AI-v1.0-MVP/
│
├── 📋 DOCUMENTATION/
│   ├── MVP_TESTING_SUMMARY.md           ⭐ Read first
│   ├── TESTER_GUIDE.md                  Detailed guide
│   ├── TESTING_CHECKLIST.md             Sign-off sheet
│   └── RELEASE_NOTES.md                 Technical details
│
├── 💻 EXTENSION/
│   └── chrome-extension/                (entire folder)
│       ├── manifest.json
│       ├── popup.html
│       ├── popup.js
│       └── ... (all other files)
│
├── 🔧 SETUP/
│   ├── BACKEND_INFO.txt                 Backend URL & endpoints
│   ├── TEST_CREDENTIALS.txt             Stripe cards & test emails
│   └── QUICK_START.md                   5-minute setup guide
│
└── 📞 CONTACT/
    └── SUPPORT_CONTACTS.txt             Who to contact if issues
```

---

## Quick Start Guide (Create This File)

Create a `QUICK_START.md` with:

```markdown
# AnswerEngineer.AI v1.0 - Quick Start (5 minutes)

## 1. Install Extension
1. Open Chrome: chrome://extensions/
2. Enable Developer Mode (top right)
3. Click Load unpacked
4. Select: chrome-extension/ folder
5. Done! Extension appears in toolbar

## 2. Verify Backend
Open terminal and run:
curl https://answerengineer-ai.onrender.com/health
Expected: {"status": "ok"}

## 3. Test Payment
1. Click extension icon
2. Enter test email: tester@gmail.com
3. Click "UPGRADE TO STARTER"
4. Use test card: 4242 4242 4242 4242
5. Complete payment
6. Check email for magic link
7. Click magic link
8. Extension should show STARTER

## 4. Start Testing
- Read: MVP_TESTING_SUMMARY.md (5 min)
- Follow: TESTER_GUIDE.md
- Use: TESTING_CHECKLIST.md

## Need Help?
See SUPPORT_CONTACTS.txt
```

---

## Optional Files to Include

**If desired, also include:**

- [ ] `BLUEPRINT_REQUIREMENTS_CHECKLIST.md` - Full blueprint mapping (for reference)
- [ ] `BUG_STATUS_SESSION.md` - Previous bug reports (for context)
- [ ] `.env.example` - Environment variables template (for reference)
- [ ] `DATABASE_SCHEMA.md` - DB structure (for understanding data)

**These are useful but not required for testing.**

---

## Recommended Package Format

### Option 1: ZIP File (Recommended)
```
AnswerEngineer-AI-v1.0-MVP.zip
├── DOCUMENTATION/
│   ├── MVP_TESTING_SUMMARY.md
│   ├── TESTER_GUIDE.md
│   ├── TESTING_CHECKLIST.md
│   └── RELEASE_NOTES.md
├── chrome-extension/
│   └── [all extension files]
├── QUICK_START.md
├── TEST_CREDENTIALS.txt
└── BACKEND_INFO.txt
```

**Advantage:** Single file to share  
**How to create:** 
```
1. Create folder: AnswerEngineer-AI-v1.0-MVP/
2. Add documentation & extension folders
3. Right-click → Send to → Compressed (zipped) folder
4. Share the .zip file
```

### Option 2: GitHub Repository
```
Share GitHub repo link with testers
- Documentation in /docs folder
- Extension in /chrome-extension folder
- Clear README.md with links to guides
- Tags/releases for version tracking
```

**Advantage:** Easy updates, version control  
**Recommended for:** Team with Git access

### Option 3: Google Drive/OneDrive
```
Upload folder structure to cloud storage
Share read-only link with testers
Easy to update without re-sharing
```

**Advantage:** Easy updates, simple sharing  
**Recommended for:** Non-technical testers

---

## What NOT to Include

❌ **Don't share:**
- Backend source code (server.js)
- Database credentials
- Stripe secret keys
- Private API keys
- `.env` files with real secrets
- Personal information
- Git history (.git folder)

✅ **Only share:**
- Frontend extension code
- Documentation
- Test credentials (only test cards!)
- Public API endpoints

---

## Pre-Handover Checklist

Before giving to testers, verify:

- [ ] Extension code is latest version
- [ ] All 4 documentation files included
- [ ] Backend is deployed & running
- [ ] Health check endpoint responds
- [ ] Stripe test mode enabled
- [ ] Test email accounts ready
- [ ] Test domains available
- [ ] ZIP file created or repo shared
- [ ] QUICK_START.md included
- [ ] Contact info provided

---

## Tester Distribution

### Send to Tester:

1. **Main Package** (ZIP or repo link)
   - All documentation
   - Extension code
   - Quick start guide

2. **Separate Email** with:
   - Test Stripe card info
   - Test email accounts
   - Backend URL
   - Health check command
   - Support contact info

3. **Access** (if applicable):
   - Supabase read-only access
   - Render dashboard access (view-only)
   - GitHub repo access

---

## Summary

### Minimum Required
✅ 4 Documentation files  
✅ Extension folder  
✅ Backend URL  
✅ Test Stripe card  
✅ Test email accounts  

### Recommended Addition
✅ QUICK_START.md  
✅ Support contact info  
✅ Database schema reference  

### Total Package Size
- Documentation: ~100 KB
- Extension code: ~200 KB
- **Total: ~300 KB** (easy to share)

---

**Ready to handover to testers!** 🚀

For questions, refer testers to MVP_TESTING_SUMMARY.md and TESTER_GUIDE.md
