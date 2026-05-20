# Sprint Plan (16-week MVP)

| Sprint | Weeks | Theme | Status |
|--------|-------|-------|--------|
| S1 | 1–2 | Foundations: repo, CI, infra, auth shell | **DONE** (this scaffold) |
| S2 | 3–4 | KYC + onboarding | **DONE** (this scaffold) |
| S3 | 5–6 | Personal Loan E2E + risk engine v1 | Next |
| S4 | 7–8 | Mandate + disbursement | |
| S5 | 9–10 | Packaged Medical + Emergency loans | |
| S6 | 11–12 | CUT-I (hero feature) | |
| S7 | 13–14 | Hardening, VAPT, perf | |
| S8 | 15–16 | iOS parity + soft launch | |

## Sprint 3 entry checklist

- [ ] NBFC partner sandbox API credentials in vault
- [ ] CIBIL/Experian sandbox credentials in vault
- [ ] Perfios/FinBox bank statement analyzer sandbox in vault
- [ ] Decision: rules-engine library (Drools-lite vs json-rules-engine)
- [ ] Loan product master designed (interest, tenure, fees per product)
- [ ] EMI schedule calculator unit tests written first (TDD)

## Definition of Done (every sprint)

1. Code merged to `develop` via PR with at least one reviewer
2. Unit tests passing in CI
3. New endpoints documented in `docs/api.md`
4. PII fields encrypted; no PII in logs
5. New DB columns have migrations + seed updates
6. Audit log entries written for all state changes
7. Feature toggled behind a flag if going to prod before MVP launch
