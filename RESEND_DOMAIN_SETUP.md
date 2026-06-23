# Resend Domain Verification Setup 📧

**Goal:** Send magic link emails to ANY email address (not just account owner)  
**Domain:** digitalventuresfz.com  
**Status:** ⏳ In Progress  
**Time Estimate:** 15-30 minutes

---

## 🔑 **Your GoDaddy Account Info**

From previous session:
```
Domain: digitalventuresfz.com
GoDaddy Account: "Developers DigitalVenturesFz"
Customer Number: 45844422
Status: Waiting for access acceptance
```

---

## ✅ **Step 1: Accept GoDaddy Account Access**

### **Find & Click the GoDaddy Email**

1. **Check your email inbox** (contact@digitalventuresfz.com)
   - Look for email from: `donotreply@godaddy.com`
   - Subject: "Account Alert: Developers DigitalVenturesFz's given you account access."

2. **Click "Accept Access" button** in the email
   - Wait for confirmation

3. **GoDaddy will send login instructions**
   - Note down the username/password (or create new one)

✅ **You now have access to the GoDaddy account!**

---

## 🔗 **Step 2: Log Into GoDaddy Account**

### **Access the Account**

1. **Go to:** https://dcc.godaddy.com

2. **Log in** with "Developers DigitalVenturesFz" credentials

3. **Find your domain**
   - Look for: `digitalventuresfz.com`
   - Click on it to open domain settings

4. **Navigate to DNS Management**
   - Click on domain name
   - Find: "DNS" or "DNS Settings" or "Manage DNS"
   - Should show current DNS records

✅ **You're in the DNS manager!**

---

## 📝 **Step 3: Get DNS Record Values from Resend**

### **Get Exact Values**

Before adding records to GoDaddy, get the exact values from Resend:

1. **Go to:** https://resend.com/domains

2. **Find your domain:** `digitalventuresfz.com`

3. **Click on domain** to open settings

4. **You'll see 3 pending records:**

   **Record 1 - DKIM:**
   - Look for section labeled: "resend._domainkey"
   - Copy the full TXT value (very long string)
   - Example: `v=DKIM1; h=sha256; k=rsa; p=MIIBIjANBgk...`

   **Record 2 - MX:**
   - Look for section labeled: "send"
   - Copy the MX value
   - Example: `feedback-smtp.us-east-1.amazonses.com`

   **Record 3 - SPF:**
   - Look for section labeled: "send" (SPF)
   - Copy the TXT value
   - Example: `v=spf1 include:sendingparams.resend.com ~all`

✅ **You have all 3 record values!**

---

## 🎯 **Step 4: Add DNS Records to GoDaddy**

### **Add Record 1: DKIM**

1. **In GoDaddy DNS manager**, click "Add Record" or "+"

2. **Fill in:**
   - **Type:** TXT
   - **Name:** `resend._domainkey`
   - **Value:** [Paste full DKIM value from Resend]
   - **TTL:** Default (usually 1 hour or "Auto")

3. **Save/Update**

✅ **Record 1 added!**

---

### **Add Record 2: MX**

1. **Click "Add Record" again**

2. **Fill in:**
   - **Type:** MX
   - **Name:** `send`
   - **Value:** `feedback-smtp.us-east-1.amazonses.com` (or value from Resend)
   - **Priority:** 10
   - **TTL:** Default

3. **Save/Update**

✅ **Record 2 added!**

---

### **Add Record 3: SPF**

1. **Click "Add Record" again**

2. **Fill in:**
   - **Type:** TXT
   - **Name:** `send`
   - **Value:** [Paste SPF value from Resend - starts with `v=spf1...`]
   - **TTL:** Default

3. **Save/Update**

✅ **Record 3 added!**

---

## ⏳ **Step 5: Wait for DNS Propagation**

### **Give it time to propagate**

- **Time needed:** 5-30 minutes (usually 5-15)
- **What's happening:** DNS changes spreading across internet servers
- **What to do:** Grab a coffee! ☕

### **Check status:**

1. **In Resend dashboard**, refresh the page
2. **Look for green checkmarks** ✅ next to each record
3. **When all 3 are green:** Domain verified! 🎉

---

## ✅ **Step 6: Verify Domain in Resend**

### **Confirm Verification**

1. **Go back to:** https://resend.com/domains

2. **Click on:** `digitalventuresfz.com`

3. **Check status:**
   - ✅ DKIM: Verified
   - ✅ MX: Verified
   - ✅ SPF: Verified

4. **When all green:**
   - Domain is verified! 🎉
   - Can now send to ANY email address

---

## 🔧 **Step 7: Update Backend Configuration**

### **Update .env file**

Once domain is verified, update backend:

**File:** `backend/.env`

```env
# Change from:
RESEND_FROM_EMAIL=onboarding@resend.dev

# To:
RESEND_FROM_EMAIL=contact@digitalventuresfz.com
```

### **Restart Backend:**

```bash
cd backend
node server.js
```

Backend now uses your domain! ✅

---

## 🧪 **Step 8: Test with Different Emails**

### **Test Magic Link with New Email**

Once domain verified and backend updated:

1. **Start backend:**
   ```bash
   node server.js
   ```

2. **Test endpoint:**
   ```bash
   curl -X POST http://localhost:5000/api/magic-link \
     -H "Content-Type: application/json" \
     -d "{\"email\":\"adegomas@gmail.com\"}"
   ```

3. **Check email:**
   - Should receive magic link at `adegomas@gmail.com` ✅
   - Click link to verify

4. **Repeat with more emails:**
   - `yourname@example.com`
   - Any email you want! ✅

---

## 🚀 **Production Ready!**

Once verified:
- ✅ Send magic links to ANY email
- ✅ Users can sign up with their own email
- ✅ No more sandbox mode restrictions
- ✅ Ready for production! 🎉

---

## ⚠️ **Troubleshooting**

### **DNS records not showing green in Resend**
**Problem:** Records added but still not verified  
**Solution:**
- Wait longer (up to 30 minutes for propagation)
- Double-check values match exactly (copy-paste, don't retype)
- Verify records are in GoDaddy (refresh page)
- Check TTL - some take longer with high TTL

### **Can't find DNS manager in GoDaddy**
**Problem:** Can't locate DNS settings  
**Solution:**
- Log in to dcc.godaddy.com
- Click domain name
- Look for "DNS" tab (usually near top)
- Or search page for "DNS"

### **Resend says records don't match**
**Problem:** Values don't match what Resend expects  
**Solution:**
- Copy EXACT value from Resend (don't add/remove anything)
- Paste into GoDaddy (don't retype)
- Make sure there are no extra spaces
- Check capitalization matches

### **Still in sandbox mode**
**Problem:** Emails still only going to account owner  
**Solution:**
- Check .env file has correct domain
- Restart backend: `node server.js`
- Check Resend dashboard - domain must show all 3 ✅
- Give it 5 more minutes for DNS to fully propagate

---

## 📊 **Progress Checklist**

Track your progress:

- [ ] Accepted GoDaddy account access
- [ ] Logged into GoDaddy
- [ ] Found DNS management
- [ ] Got DKIM value from Resend
- [ ] Got MX value from Resend
- [ ] Got SPF value from Resend
- [ ] Added DKIM record to GoDaddy
- [ ] Added MX record to GoDaddy
- [ ] Added SPF record to GoDaddy
- [ ] Waited 5-30 minutes for propagation
- [ ] All 3 records show ✅ in Resend
- [ ] Updated backend .env file
- [ ] Restarted backend
- [ ] Tested with different email
- [ ] Magic link arrived! ✅

---

## 🎉 **Success!**

Once complete:
- ✅ Domain verified in Resend
- ✅ Can send to unlimited emails
- ✅ Ready for production
- ✅ Users can sign up with any email

---

**Next:** Test the complete flow end-to-end! 🚀

**Time estimate:** 15-30 minutes total  
**Difficulty:** Easy ✅

Ready to start? 👇
