# API Integration Test Report
Run Date: Thu Apr 23 01:18:21 IST 2026
Environment: production

| Test Name | Endpoint | Status | Response Time (s) | HTTP Code |
|-----------|----------|--------|-------------------|-----------|
| Register Jobseeker | `POST /api/auth/register/new` | ❌ FAIL | 0.007524 | 000 |
| Login Jobseeker | `POST /api/auth/login` | ❌ FAIL | 0.013784 | 000 |
| Register Recruiter | `POST /api/auth/register/new` | ❌ FAIL | 0.003876 | 000 |
| Login Recruiter | `POST /api/auth/login` | ❌ FAIL | 0.005895 | 000 |
| Sitemap Header Verification | `HEAD https://www.zplusejobs.com/sitemap.xml` | ❌ FAIL | 0.003962 | 000 |
| Robots.txt Verification | `GET https://www.zplusejobs.com/robots.txt` | ❌ FAIL | 0.003940 | 000 |
