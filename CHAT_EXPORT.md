# SingDeposit: Singapore Fixed Deposit Calculator - Chat & Development Log

**Project**: Singapore Fixed Deposit Calculator with MAS Benchmark Integration  
**Repository**: `https://github.com/amkgal/fixed-D.git`  
**Date**: October 5, 2026  

---

## Turn 1: Initial Implementation Request

### User Prompt
> build me a simple singapore based fixed deposit calculator that reads MAS backend Interest Rates of Banks and Finance Companies Yearly rates for calculating interests accurately and efficiently. Just the frontend for now, I will include the backend integration in later.

### Assistant Response Summary
- Conducted design & domain review for financial dashboard aesthetics (SaaS guidelines, tabular figures `font-mono tabular-nums`, clean typography, no pill badges, 60-30-10 palette).
- Built the **Singapore Fixed Deposit Calculation Engine** (`src/utils/calculator.ts`):
  - Act/365 Singapore money market day count convention.
  - Tenors: 1, 3, 6, 9, 12, 18, 24, 36 months with month-end date clamping.
  - Compounding frequencies: At Maturity (Simple), Monthly, Quarterly, Annually.
  - Return metrics: Total Interest (SGD), Maturity Value (SGD), Effective Annual Rate (EAR / APY), Daily Interest ($/day).
  - Statutory SDIC Protection: Checks against Singapore Deposit Insurance Scheme S$100,000 statutory cap per Scheme Member bank or finance company.
  - IRAS Individual Tax Exemption disclosures.
- Integrated **Monetary Authority of Singapore (MAS) Table I.1 Benchmark Data** (`src/data/masData.ts` & `src/components/MasBenchmarkViewer.tsx`):
  - Commercial Banks (1M, 3M, 6M, 12M) vs. Finance Companies (3M, 6M, 12M) annual series (2018–2025).
  - Historical table with spread analysis.
- Built **Singapore Commercial Banks & Finance Companies Comparison** (`src/components/ComparisonTable.tsx`):
  - 12 institutions: DBS/POSB, OCBC, UOB, CIMB, Standard Chartered, Maybank, HSBC, RHB, BOC, Hong Leong Finance, Sing Investments & Finance (SIF), Singapura Finance.
  - Real-time interest calculation, sorting, and 1-click rate selection.
- Created **Plug-and-Play Backend Integration Layer** (`src/services/masApiService.ts` & `src/components/BackendIntegrationModal.tsx`):
  - Configurable backend URL input, live connection test tool with latency measurement, and JSON schema contract documentation.
- Built **Interest Accrual & Payout Schedule Modal** (`src/components/ScheduleModal.tsx`):
  - Period-by-period balance table with CSV export.

---

## Turn 2: GitHub Repository Push

### User Prompt
> git push https://<GITHUB_PERSONAL_ACCESS_TOKEN>@https://github.com/amkgal/fixed-D.git

### Assistant Response Summary
- Initialized local Git repository on branch `main`.
- Staged all application code, configuration, assets, and dependencies.
- Created root commit: `Initial commit: Singapore Fixed Deposit Calculator with MAS Interest Rates benchmarks`.
- Added remote origin and pushed to `https://github.com/amkgal/fixed-D.git`.
- Sanitized remote URL in Git configuration to prevent leaving access token in plaintext.

---

## Turn 3: Serverless MAS Connection Setup

### User Prompt
> add a serverless connection that pulls MAS data using the following end points: 
> 
> - store this in /api folder (at project root level) NOT src file
> - include /health.ts and /fixedd.ts within the same subfolder
> - do not hardcode any api keys, I will include them manually
> 
> # Interest Rates of Banks and Finance Companies - Yearly:
> eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610ora/interest_rates_of_banks_and_finance_companies_yearly
> 
> # All requests need the header: KeyId: <MAS_KEY_ID>

### Assistant Response Summary
- Created project-root `/api` folder:
  - **`/api/health.ts`**:
    - Dual runtime compatible (Node.js/Express serverless + Web Edge Request/Response standard).
    - Returns JSON status, uptime, and checks whether `process.env.MAS_KEY_ID` is configured.
  - **`/api/fixedd.ts`**:
    - Connects server-side to:
      `https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610ora/interest_rates_of_banks_and_finance_companies_yearly`
    - Injects required header: `KeyId: <MAS_KEY_ID>`
    - Reads dynamically from `process.env.MAS_KEY_ID` (or incoming `KeyId` request header); no hardcoded API keys.
    - Forwards query parameters, enables CORS headers, handles error states (401/403/500), and returns normalized `records` alongside `raw` MAS response.
- Implemented **`server.ts`** at project root running Express with `vite.middlewares` mounted in development:
  - Serves `/api/health` and `/api/fixedd`.
  - Configured `"dev": "tsx server.ts"` and `"start": "tsx server.ts"` in `package.json`.
- Updated **`.env.example`** with `MAS_KEY_ID="YOUR_MAS_KEY_ID_HERE"`.
- Verified live endpoint tests using `curl`:
  - `GET /api/health` -> `{"status":"ok", ...}`
  - `GET /api/fixedd` -> `{"success":false, "error":"MAS_KEY_ID_NOT_CONFIGURED", ...}`
  - `GET /api/fixedd` with `KeyId: test-key` -> successfully contacted MAS APIMG Gateway.
- Committed all serverless changes and pushed branch `main` to `https://github.com/amkgal/fixed-D.git`.

---

## Turn 4: Chat Export

### User Prompt
> export this entire chat as a .md file

### Assistant Response Summary
- Generated and saved this complete transcript as `CHAT_EXPORT.md` in the project root directory and pushed it to the repository.
