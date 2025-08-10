# Scam Shield Dashboard — Enhanced Railway-ready Starter

## Summary
This repo contains an enhanced starter dashboard for Scam Shield Society with:
- Members CRUD (notes, roles, trust, flagged)
- Timeseries (members per date)
- Export/import endpoints
- Simple admin auth endpoint (password via env)

## Default admin password
The default admin password is: `scamshield-admin-2025!`
**Change it** by creating a `.env` file in the project root with:
```
ADMIN_PASSWORD=yourSuperSecretPasswordHere
```

## Quick run locally
1. Install Node.js (LTS)
2. Run:
   ```
   npm install
   npm run build
   npm start
   ```
3. Open http://localhost:3000

## Deploying to Railway
- Push repo to GitHub.
- Ensure you commit `package-lock.json` after running `npm install` locally.
- On Railway, set Build Command: `npm run build`
- Start Command: `npm start`
- Add an environment variable `ADMIN_PASSWORD` in Railway if you want to change it from the default.

## Notes about persistence
This starter uses `data.json` to store data. Back up via `/api/export`. For production persistence, migrate to Supabase/Postgres.
