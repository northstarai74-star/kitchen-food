# Vercel Deployment Setup for Kitchen Food

## ✅ Current Setup
- ✅ `api/generate-dish.js` - AI recipe generation endpoint
- ✅ `api/seo.js` - SEO files endpoint  
- ✅ `vercel.json` - Configuration file
- ✅ `public/` - Static files

## ❌ Missing Configuration

### **Step 1: Connect GitHub Repository**
1. Go to **Vercel Dashboard**: https://vercel.com
2. Click **"Add New"** → **"Project"**
3. Select your GitHub repo: `kitchen-food`
4. Click **Import**

---

### **Step 2: Set Environment Variables**
After importing, go to **Settings** → **Environment Variables**

Add these variables:

#### **Option A: Use Local Ollama** (Recommended)
```
USE_LOCAL_MODEL=true
OLLAMA_MODEL=llama3.2
OLLAMA_PORT=11434
```

#### **Option B: Use Anthropic API** (Cloud)
```
USE_LOCAL_MODEL=false
ANTHROPIC_API_KEY=your-api-key-here
```

> **Note**: On Vercel, local Ollama won't work (Ollama runs on your computer). 
> For production, use **Option B** with Anthropic API.

---

### **Step 3: Update Supabase Redirect URLs**
1. Go to **Supabase Dashboard**
2. **Authentication → URL Configuration**
3. Add your Vercel URLs:
   - `https://your-vercel-url.vercel.app`
   - `https://kitchen-food.vercel.app` (if that's your domain)
4. **Save**

---

### **Step 4: Deploy**
1. In Vercel dashboard, click **"Deploy"**
2. Wait for build to complete
3. Get your live URL: `https://your-project.vercel.app`

---

## 🚨 Common Issues & Fixes

### **Issue: "Write with AI" button doesn't work**
**Cause**: `USE_LOCAL_MODEL=true` on Vercel (Ollama not accessible)
**Fix**: Set `USE_LOCAL_MODEL=false` and add `ANTHROPIC_API_KEY`

### **Issue: Sign in doesn't work**
**Cause**: Supabase redirect URLs not configured
**Fix**: Add your Vercel URL to Supabase URL Configuration

### **Issue: 404 on /api/generate-dish**
**Cause**: Vercel didn't build API functions
**Fix**: Check that `api/` folder exists with `.js` files (not in .gitignore)

---

## 📋 Checklist Before Going Live

- [ ] GitHub repo connected to Vercel
- [ ] Environment variables set
- [ ] Supabase redirect URLs updated
- [ ] Email verification disabled in Supabase (or configured)
- [ ] Deploy successful (no build errors)
- [ ] Sign up works on Vercel link
- [ ] "Add a dish" works (uses AI or Ollama)
- [ ] Photos upload and display

---

## 🔗 Your Links

| Environment | URL |
|-------------|-----|
| Local Dev | http://localhost:5501 |
| Vercel | https://your-project.vercel.app |
| Supabase | https://ruwndgtsequulazlbfhd.supabase.co |

---

## 💡 For Production

1. **Use Anthropic API** instead of local Ollama
2. **Enable email verification** in Supabase (after configuring SMTP or OAuth)
3. **Set up custom domain** (yourapp.com)
4. **Enable HTTPS** (automatic on Vercel)
5. **Configure backups** for Supabase

---

## 🆘 Still Having Issues?

Run locally to isolate the problem:
```bash
npm install
npm start
# Opens http://localhost:5501
```

Then identify if the issue is:
- **Local app works** → Problem is Vercel configuration
- **Local app broken** → Problem is in the code itself
