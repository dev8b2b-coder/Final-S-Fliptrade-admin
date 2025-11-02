# Vercel Deployment Guide

## Supabase Database Setup

Aapka app **Supabase** database ke saath integrated hai aur **kv_store** use kar raha hai data store karne ke liye.

## Vercel par Deploy karne ke liye:

### 1. Environment Variables Setup (Zaroori)

Vercel dashboard mein yeh environment variables add karein:

#### Supabase Configuration (Required)
```
SUPABASE_URL=https://hjdcmozfjhhlmjqootoq.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Service Role Key kahan se milega?**
1. [Supabase Dashboard](https://supabase.com/dashboard) par login karein
2. Project select karein (`hjdcmozfjhhlmjqootoq`)
3. Settings → API → Service Role Key copy karein
4. **Warning**: Service Role Key ko kabhi publicly expose mat karein!

#### Email Service Configuration (Optional - agar emails chahiye)
Email functionality ke liye ek service choose karein:

**Option 1: Resend (Recommended)**
```
RESEND_API_KEY=your_resend_api_key_here
```

**Option 2: SendGrid**
```
SENDGRID_API_KEY=your_sendgrid_api_key_here
```

**Option 3: SMTP**
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

### 2. Vercel par Deploy karna

#### Method 1: Vercel CLI se
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

#### Method 2: GitHub Integration se
1. GitHub par code push karein
2. [Vercel Dashboard](https://vercel.com/dashboard) mein new project create karein
3. GitHub repository select karein
4. Environment variables add karein (step 1 se)
5. Deploy button click karein

### 3. Vercel Project Settings

Vercel mein automatically yeh settings detect ho jayengi:
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 4. Supabase Edge Functions Setup

Agar aap **Supabase Edge Functions** use kar rahe hain (backend server), to:

1. Supabase Dashboard → Edge Functions
2. `src/supabase/functions/server` folder ko Edge Function ke roop mein deploy karein
3. Environment variables wahi bhi set karein

Ya phir aap Vercel Serverless Functions use kar sakte hain (recommended for this project).

### 5. Important Notes

✅ **Database**: 
- Supabase database already configured hai
- KV Store (`kv_store_63060bc2` table) already create ho chuka hai
- Data automatically Supabase mein store hoga

✅ **Frontend**:
- Frontend mein hardcoded Supabase credentials hain (projectId aur publicAnonKey)
- Yeh secure hain kyunki sirf public anon key hai
- Production mein bhi kaam karegi

✅ **Backend**:
- Server functions ko environment variables ki zarurat hai
- Vercel mein environment variables properly set karein

### 6. Deployment Checklist

- [ ] Vercel account create/verify
- [ ] GitHub repository push (agar CLI use nahi kar rahe)
- [ ] Environment variables add kiye:
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `RESEND_API_KEY` ya `SENDGRID_API_KEY` (optional)
- [ ] Build settings verify kiye
- [ ] Deploy button click kiya
- [ ] Production URL test kiya

### 7. Troubleshooting

**Issue**: "SUPABASE_URL is not defined"
**Solution**: Vercel dashboard mein environment variable properly set karein

**Issue**: "Connection refused to Supabase"
**Solution**: 
- Service Role Key verify karein
- Supabase project active hai ya nahi check karein

**Issue**: "Email not sending"
**Solution**: 
- Email service API key verify karein
- Agar optional hai, to email functionality kaam nahi karegi (login/signup phir bhi kaam karega)

### 8. Post-Deployment

Deployment ke baad:
1. Production URL test karein
2. Login functionality test karein
3. Database operations verify karein
4. Email functionality test karein (agar configured hai)

## Quick Reference

**Required Environment Variables:**
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (supabase dashboard se)

**Optional Environment Variables:**
- `RESEND_API_KEY` - Email service
- `SENDGRID_API_KEY` - Email service  
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASSWORD` - SMTP email

**Supabase Project Info:**
- Project ID: `hjdcmozfjhhlmjqootoq`
- Dashboard: https://supabase.com/dashboard/project/hjdcmozfjhhlmjqootoq

---

**Note**: Yeh guide aapko Vercel par deploy karne mein help karega. Koi issue aaye to Supabase dashboard aur Vercel logs check karein.

