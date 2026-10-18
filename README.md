# Sentri Remote Reporting System (Sentri Core)

Audit & Reporting Management System with Role-Based Access Control (25 Permissions).

---

## 🚀 How to Run Locally (Without AI)

### Option 1: Double-Click Launcher (Easiest on Windows)
1. Navigate to the project directory in Windows File Explorer:
   `C:\Users\Norby\.gemini\antigravity\scratch\sentri-reporting-system`
2. Double-click **`start.bat`**.
3. It will automatically start the server and open `http://localhost:3000` in your default browser.

---

### Option 2: Using Command Prompt (cmd)
1. Press `Win + R`, type `cmd`, and press Enter.
2. Navigate to this directory:
   ```cmd
   cd C:\Users\Norby\.gemini\antigravity\scratch\sentri-reporting-system
   ```
3. Start the application:
   ```cmd
   npm run dev -- --port 3000
   ```
4. Open your browser and go to:
   ```
   http://localhost:3000
   ```

---

### Option 3: Using PowerShell
*(Note: On Windows PowerShell, use `npm.cmd` if script execution policy is restricted)*
1. Open PowerShell and run:
   ```powershell
   cd C:\Users\Norby\.gemini\antigravity\scratch\sentri-reporting-system
   npm.cmd run dev -- --port 3000
   ```
2. Open your browser at `http://localhost:3000`.

---

## 📦 How to Build for Production / Hosting

If you want to build a standalone production version to host on any web server (Apache, Nginx, Vercel, Netlify, or IIS):

1. Run the build command:
   ```cmd
   npm.cmd run build
   ```
2. This creates an optimized **`dist`** folder containing static HTML, CSS, and JS files.
3. You can preview the production build locally anytime with:
   ```cmd
   npm.cmd run preview -- --port 3000
   ```

---

## 🛡️ Built-in Features & Roles
- **Standard Audits**: Schedule Dashboard, Conducting Audits, Yes/No/NA scoring, Partial Credit point overrides (`*`), Speed of Service (`Counter`, `Drive Thru`, `Reception`), Incidents, and PDF downloads.
- **Sentri Core Security Module**: Real-Time Audit Dashboard with live telemetry, Incident Reports workflow (`Pending` -> `In Review` -> `Closed` -> `Void`), Surveillance Audit & Review (`My Schedule` embedded + `Sentri Shift Audits` for `Office Tower`, `Mall`, `Parking`).
- **Administration**: Question Sets, Dropdowns, Locations, User Profiles & Invites, Custom Roles & Permissions (25 system permissions), and Dynamic 23-Section User Manual PDF generator.

