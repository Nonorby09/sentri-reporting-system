# Sentri Remote Reporting System (Sentri Core)

Audit & Reporting Management System with Role-Based Access Control (25 Permissions).

---

## 🚀 How to Deploy on Vercel

This repository is pre-configured and 100% **Vercel-ready**:
- `vercel.json` with SPA routing rewrites and asset caching headers
- Optimized Vite build with automatic code-splitting (vendor & PDF chunks)
- `.gitignore` configured to prevent committing dependencies and build output

### Option A: Deploy via Vercel Dashboard (Recommended)
1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "Configure Vercel ready deployment"
   git push origin main
   ```
2. Go to [vercel.com](https://vercel.com) and log in.
3. Click **"Add New..."** → **"Project"**.
4. Import your GitHub repository (`sentri-reporting-system`).
5. Vercel automatically detects **Vite**:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
6. Click **Deploy**. Your app will be live in ~30 seconds with an SSL-enabled `.vercel.app` URL.

### Option B: Deploy via Vercel CLI
If you have Vercel CLI installed:
```bash
npm i -g vercel
vercel
```
Follow the prompts (accept default settings) to deploy directly. For production:
```bash
vercel --prod
```

---

## 💻 How to Run Locally

### Option 1: Double-Click Launcher (Windows)
Double-click **`start.bat`** in the project root.

### Option 2: Command Line
```bash
npm run dev -- --port 3000
```
Open `http://localhost:3000` in your browser.

---

## 📦 How to Test Production Build Locally

```bash
npm run build
npm run preview -- --port 3000
```

---

## 🛡️ Built-in Features & Roles
- **Secured Authentication**: SHA-256 Web Crypto hashing, session persistence, brute-force lockout protection, account registration.
- **Default Accounts**:
  - Administrator: `alex.mercer@sentri.io` / `Admin@2026`
  - Supervisor: `sarah.j@sentri.io` / `Supervisor@2026`
  - Operator: `carlos.r@sentri.io` / `Operator@2026`
  - Client: `david.chen@jollibeegroup.com` / `Client@2026`
- **Standard Audits**: Schedule Dashboard, Conducting Audits, Yes/No/NA scoring, Partial Credit point overrides (`*`), Speed of Service (`Counter`, `Drive Thru`, `Reception`), Incidents, and PDF downloads.
- **Sentri Core Security Module**: Real-Time Audit Dashboard with live telemetry, Incident Reports workflow (`Pending` -> `In Review` -> `Closed` -> `Void`), Surveillance Audit & Review (`My Schedule` embedded + `Sentri Shift Audits` for `Office Tower`, `Mall`, `Parking`).
- **Administration**: Question Sets, Dropdowns, Locations, User Profiles & Invites, Custom Roles & Permissions (25 system permissions), and Dynamic 23-Section User Manual PDF generator.
