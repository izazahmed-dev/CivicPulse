# FieldBridge

FieldBridge is a self-contained hackathon MVP for multilingual public-service incident resolution focused on water and sanitation issues. It is designed to show a credible closed loop:

1. A citizen reports an issue
2. An operator triages and updates the incident
3. A verifier submits proof
4. The issue is transparently closed

## Routes

- `/` landing page
- `/report` citizen intake
- `/track/[id]` public tracking
- `/ops` operator dashboard
- `/verify/[id]` proof + closure flow

## Scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
```

The app intentionally uses parent-level dependencies already installed in the root workspace, so it can run without a second package install.

## Environment

Copy `.env.example` to `.env.local` if you want live AI parsing. Without it, the app runs fully in mock/demo mode.

