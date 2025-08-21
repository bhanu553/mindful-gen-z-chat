# 🌍 **ENVIRONMENT VARIABLES GUIDE - ECHOMIND**

## 📋 **REQUIRED ENVIRONMENT VARIABLES**

### **Vercel Environment Variables (Production)**

Set these in your Vercel project dashboard under Settings > Environment Variables:

#### **1. Supabase Configuration**
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

#### **2. OpenAI Configuration**
```bash
OPENAI_API_KEY=sk-your_openai_api_key_here
```

#### **3. PayPal Configuration**
```bash
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_WEBHOOK_ID=your_paypal_webhook_id
```

### **Frontend Environment Variables (Vite)**

Create a `.env.local` file in your project root for local development:

```bash
# PayPal Client ID (for frontend)
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id

# Supabase (for frontend)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🔧 **SETUP INSTRUCTIONS**

### **Step 1: Vercel Environment Variables**

1. Go to your Vercel project dashboard
2. Navigate to **Settings** > **Environment Variables**
3. Add each variable with the exact names above
4. Set **Environment** to **Production** for all variables
5. Click **Save** after each variable

### **Step 2: Local Development**

1. Create `.env.local` file in project root
2. Add the Vite environment variables
3. **Never commit this file** (it's in .gitignore)

### **Step 3: Verify Configuration**

After setting environment variables:

1. **Redeploy** your Vercel project
2. **Restart** your local development server
3. Check that all API endpoints work correctly

## 🚨 **CRITICAL NOTES**

### **Security Requirements**
- ✅ **SUPABASE_SERVICE_ROLE_KEY**: Keep secret, never expose to frontend
- ✅ **PAYPAL_CLIENT_SECRET**: Keep secret, never expose to frontend
- ✅ **OPENAI_API_KEY**: Keep secret, never expose to frontend

### **Frontend vs Backend**
- **Backend (Vercel)**: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `PAYPAL_CLIENT_SECRET`
- **Frontend (Vite)**: `VITE_PAYPAL_CLIENT_ID`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

### **PayPal Configuration**
1. Get credentials from [PayPal Developer Dashboard](https://developer.paypal.com/)
2. Set webhook URL to: `https://yourdomain.com/api/paypal-webhook`
3. Configure webhook events: `PAYMENT.CAPTURE.COMPLETED`, `CHECKOUT.ORDER.APPROVED`

## 🔍 **TROUBLESHOOTING**

### **Common Issues**

#### **"Environment variable not found"**
- ✅ Check variable names are exact (case-sensitive)
- ✅ Ensure variables are set for Production environment
- ✅ Redeploy after adding variables

#### **"PayPal client ID undefined"**
- ✅ Check `VITE_PAYPAL_CLIENT_ID` is set in `.env.local`
- ✅ Restart development server after adding variables

#### **"Supabase connection failed"**
- ✅ Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are correct
- ✅ Check Supabase project is active and accessible

### **Testing Environment Variables**

Use the health check endpoint to verify configuration:
```bash
curl https://yourdomain.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "supabase": "connected",
  "openai": "configured",
  "paypal": "configured"
}
```

## 📱 **DEPLOYMENT CHECKLIST**

Before deploying to production:

- [ ] All Vercel environment variables set
- [ ] PayPal webhook configured
- [ ] Supabase project active
- [ ] OpenAI API key valid
- [ ] Local `.env.local` created
- [ ] Environment variables tested locally
- [ ] Production deployment successful
- [ ] Health check endpoint responding

## 🆘 **SUPPORT**

If you encounter issues:

1. **Check Vercel logs** for environment variable errors
2. **Verify variable names** match exactly
3. **Ensure Production environment** is selected
4. **Redeploy** after any changes
5. **Test locally** with `.env.local` first

---

**Remember**: Environment variables are case-sensitive and must be set exactly as shown above.

