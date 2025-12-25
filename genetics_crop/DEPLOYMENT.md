# Deployment Guide

## 🚀 Deploy on Vercel (Recommended)

Your project is already configured for Vercel with `vercel.json`.

### Steps:

1. **Sign up/Login to Vercel**
   - Go to https://vercel.com
   - Sign in with your GitHub account

2. **Import Your Repository**
   - Click "New Project"
   - Import `manyaasharma07/genetics_crop`
   - Vercel will auto-detect Vite settings

3. **Configure Build Settings** (usually auto-detected):
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)
   - Your app will be live at `your-project.vercel.app`

5. **Environment Variables** (if needed later):
   - Go to Project Settings → Environment Variables
   - Add any API keys or configs

### Automatic Deployments:
- Every push to `main` branch = automatic deployment
- Preview deployments for pull requests

---

## 🌐 Alternative: Deploy on Netlify

1. **Sign up at https://netlify.com**
2. **Connect GitHub repository**
3. **Build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
4. **Deploy**

---

## 📦 Alternative: Deploy on GitHub Pages

1. **Install gh-pages:**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add to package.json scripts:**
   ```json
   "deploy": "npm run build && gh-pages -d dist"
   ```

3. **Deploy:**
   ```bash
   npm run deploy
   ```

---

## ⚠️ Important Notes

### Current ML Pipeline Limitation:
Your ML pipeline runs **client-side** (in the browser). This means:
- ✅ Works great for small datasets
- ⚠️ Large models may be slow
- ⚠️ Model training happens in user's browser

### For Production ML Backend:
If you need server-side ML processing, consider:
1. **Python FastAPI backend** + React frontend
2. **Streamlit** (Python-only, would require rewriting frontend)
3. **Separate ML API** (Python/Flask) + React frontend

---

## 🔧 Troubleshooting

### Build Fails:
- Check Node.js version (should be 18+)
- Run `npm install` locally first
- Check for TypeScript errors: `npm run lint`

### ML Model Not Loading:
- Ensure CSV file is in `public/` folder
- Check browser console for errors
- Verify model was trained and saved

### Routing Issues:
- Vercel config (`vercel.json`) handles SPA routing
- For other platforms, ensure 404 redirects to `index.html`

