# 🚨 IMMEDIATE CORS FIX - Nandighosh Bus Service

## ⚡ **URGENT: Fix CORS Error Now**

You're getting this error because your **Supabase Site URL is not configured** for your current domain.

### **🔍 Current Issue:**
```
Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at https://xjhmzuqjntwhhpzrhyck.supabase.co/auth/v1/token
```

### **✅ IMMEDIATE FIX (Takes 2 minutes):**

#### **Step 1: Go to Supabase Dashboard**
1. Open [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project: `lcxmwghgehhrabhaqgxl`
3. **Direct link**: [https://supabase.com/dashboard/project/lcxmwghgehhrabhaqgxl](https://supabase.com/dashboard/project/lcxmwghgehhrabhaqgxl)

#### **Step 2: Configure Site URL**
1. Go to **Settings** → **Authentication** → **URL Configuration**
2. Set **Site URL** to your current domain:
   - **Local Development**: `http://localhost:3000`
   - **Production**: `https://your-domain.com`

#### **Step 3: Add Redirect URLs**
Add these to **Redirect URLs**:
- `http://localhost:3000/**` (for development)
- `https://your-domain.com/**` (for production)
- `http://localhost:3000/auth/callback`
- `https://your-domain.com/auth/callback`

#### **Step 4: Save and Test**
1. Click **Save** in Supabase Dashboard
2. Wait 30 seconds for changes to propagate
3. Try signing in again

---

## 🔧 **Dual Authentication Strategy Implemented**

I've implemented a **dual-strategy authentication system** that will work even with CORS issues:

### **Strategy 1: Server-Side Proxy (CORS-Free)**
- Uses `/api/auth/signin` endpoint
- Bypasses CORS completely
- Works even if Site URL is misconfigured

### **Strategy 2: Direct Supabase Client (Fallback)**
- Direct browser → Supabase communication
- Requires proper Site URL configuration
- Provides detailed CORS error messages

### **How It Works:**
```
1. Try server-side proxy first (no CORS issues)
2. If proxy fails, try direct client
3. If both fail, show detailed CORS fix instructions
```

---

## 🎯 **Error Messages Explained**

### **"NetworkError when attempting to fetch resource"**
- **Cause**: Site URL not configured in Supabase
- **Fix**: Set Site URL to your current domain

### **"CORS request did not succeed"**
- **Cause**: Browser blocking cross-origin request
- **Fix**: Configure Supabase Site URL and Redirect URLs

### **"Referrer Policy: Ignoring the less restricted referrer policy"**
- **Cause**: Browser security warning (not critical)
- **Fix**: Will resolve when CORS is fixed

---

## 📋 **Complete Configuration Checklist**

### **Supabase Dashboard Settings:**
- [ ] **Site URL**: Set to your domain (`http://localhost:3000` or `https://your-domain.com`)
- [ ] **Redirect URLs**: Include your domain with `/**` wildcard
- [ ] **Auth Providers**: Email/Password enabled
- [ ] **Email Templates**: Configured (optional)

### **Environment Variables:**
- [ ] `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

### **Local Development:**
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://lcxmwghgehhrabhaqgxl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### **Production Deployment:**
- Set environment variables in your hosting platform
- Ensure Site URL matches your production domain

---

## 🚀 **Testing Your Fix**

### **1. After Configuring Supabase:**
1. Clear browser cache and localStorage
2. Try signing in with test credentials
3. Check browser console for success messages

### **2. Expected Success Messages:**
```
Auth: Starting CORS-friendly authentication with fallback
Auth: Server-side proxy authentication successful
```

### **3. If Still Failing:**
```
Auth: Server-side proxy failed, trying direct client
Auth: Direct authentication successful for user: [user-id]
```

---

## 🔍 **Advanced Troubleshooting**

### **If Server-Side Proxy Fails:**
1. Check if `/api/auth/signin` endpoint exists
2. Verify environment variables are set
3. Check server logs for errors

### **If Direct Client Fails:**
1. Verify Site URL exactly matches your domain
2. Check Redirect URLs include wildcard (`/**`)
3. Wait 30 seconds after Supabase config changes

### **If Both Methods Fail:**
1. Check network connectivity
2. Verify Supabase project is active
3. Check environment variables are correct
4. Try different browser or incognito mode

---

## 💡 **Why This Happens**

### **CORS (Cross-Origin Resource Sharing)**
- Browser security feature
- Blocks requests to different domains
- Supabase requires explicit domain approval

### **Site URL Configuration**
- Tells Supabase which domains are allowed
- Must match exactly (including protocol)
- Wildcards not allowed in Site URL

### **Redirect URLs**
- Used for OAuth flows
- Can include wildcards (`/**`)
- Multiple URLs allowed

---

## ✅ **Success Indicators**

### **Authentication Working:**
- No CORS errors in console
- User can sign in successfully
- Session persists across page reloads
- User profile loads correctly

### **Console Messages:**
```
Auth: Starting CORS-friendly authentication with fallback
Auth: Server-side proxy authentication successful
AuthContext: Sign-in successful for user: [user-id]
AuthContext: User profile loaded successfully
```

---

## 🎯 **Quick Fix Summary**

1. **Go to Supabase Dashboard**
2. **Settings → Authentication → URL Configuration**
3. **Set Site URL to your current domain**
4. **Add Redirect URLs with wildcards**
5. **Save and wait 30 seconds**
6. **Try signing in again**

**This should fix your CORS issue immediately!**
