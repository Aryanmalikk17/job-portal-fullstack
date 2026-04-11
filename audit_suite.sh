#!/bin/bash
# Zpluse Jobs Platform - API Audit Suite (Phase 4 Bypass - FINAL)

API_URL="http://localhost:8080"
TIMESTAMP=$(date +%s)
SEEKER_EMAIL="audit_seeker_${TIMESTAMP}@zpluse.test"
RECRUITER_EMAIL="audit_recruiter_${TIMESTAMP}@zpluse.test"
PASS="Audit@Pass123"

log() { echo -e "[$(date +'%H:%M:%S')] $1"; }
report_row() { echo "| $1 | $2 | $3 | $4 |"; }

echo "# API Audit Report - $(date)"
echo ""
report_row "Endpoint" "Method" "Status" "Result"
report_row "---" "---" "---" "---"

# 1. Seeker Registration
log "Reg Seeker: ${SEEKER_EMAIL}"
CODE_REG_S=$(curl -s -o /dev/null -w "%{http_code}" -X POST ${API_URL}/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${SEEKER_EMAIL}\",\"password\":\"${PASS}\",\"firstName\":\"Audit\",\"lastName\":\"Seeker\",\"userTypeId\":2}")
report_row "/api/auth/register (Seeker)" "POST" "$CODE_REG_S" "$([ "$CODE_REG_S" == "200" ] || [ "$CODE_REG_S" == "201" ] && echo "✅ Success" || echo "❌ Failed")"

# 2. Recruiter Registration
log "Reg Recruiter: ${RECRUITER_EMAIL}"
CODE_REG_R=$(curl -s -o /dev/null -w "%{http_code}" -X POST ${API_URL}/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${RECRUITER_EMAIL}\",\"password\":\"${PASS}\",\"firstName\":\"Audit\",\"lastName\":\"Recruiter\",\"userTypeId\":1}")
report_row "/api/auth/register (Recruiter)" "POST" "$CODE_REG_R" "$([ "$CODE_REG_R" == "200" ] || [ "$CODE_REG_R" == "201" ] && echo "✅ Success" || echo "❌ Failed")"

# 3. Login (Seeker)
RES_LOGIN_S=$(curl -s -X POST ${API_URL}/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${SEEKER_EMAIL}\",\"password\":\"${PASS}\"}")
S_TOKEN=$(echo $RES_LOGIN_S | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# 4. Login (Recruiter)
RES_LOGIN_R=$(curl -s -X POST ${API_URL}/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${RECRUITER_EMAIL}\",\"password\":\"${PASS}\"}")
R_TOKEN=$(echo $RES_LOGIN_R | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# 5. Seeker Profile Fix Verification
log "Verifying Job Seeker Profile Fix..."
CODE_PUT_S=$(curl -s -o /dev/null -w "%{http_code}" -X PUT ${API_URL}/api/profile/job-seeker \
  -H "Authorization: Bearer ${S_TOKEN}" \
  -F "firstName=Audit" \
  -F "lastName=Seeker" \
  -F "phone=1234567890" \
  -F "city=NYC" \
  -F "linkedinProfile=linkedin.com/in/auditseeker" \
  -F "userId=1" )
report_row "/api/profile/job-seeker" "PUT" "$CODE_PUT_S" "$([ "$CODE_PUT_S" == "200" ] && echo "✅ FIXED" || echo "❌ 500 ERROR")"

# 6. Recruiter Profile Fix Verification
log "Verifying Recruiter Profile Fix..."
CODE_PUT_R=$(curl -s -o /dev/null -w "%{http_code}" -X PUT ${API_URL}/api/profile/recruiter \
  -H "Authorization: Bearer ${R_TOKEN}" \
  -F "firstName=Audit" \
  -F "lastName=Recruiter" \
  -F "company=AuditCorp" \
  -F "city=SF" )
report_row "/api/profile/recruiter" "PUT" "$CODE_PUT_R" "$([ "$CODE_PUT_R" == "200" ] && echo "✅ FIXED" || echo "❌ 500 ERROR")"

# 7. Job Creation (Recruiter)
log "Creating Job Post..."
RES_JOB=$(curl -s -X POST ${API_URL}/api/jobs \
  -H "Authorization: Bearer ${R_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"jobTitle\":\"Audit Engineer ${TIMESTAMP}\",\"descriptionOfJob\":\"Testing fixed JPA persistence.\",\"remote\":\"Remote-Only\",\"jobType\":\"Full-Time\",\"salary\":\"100000\",\"jobLocationId\":1,\"jobCompanyId\":1}")
JOB_ID=$(echo $RES_JOB | grep -o '"jobPostId":[0-9]*' | head -1 | cut -d: -f2)
CODE_JOB=$(echo $RES_JOB | grep -o '"success":true' > /dev/null && echo "201" || echo "400")
report_row "/api/jobs" "POST" "$CODE_JOB" "$([ ! -z "$JOB_ID" ] && echo "✅ Created ID: $JOB_ID" || echo "❌ Failed")"

# 8. Job Application (Seeker)
if [ ! -z "$JOB_ID" ]; then
  log "Applying to Job ID: $JOB_ID..."
  CODE_APPLY=$(curl -s -o /dev/null -w "%{http_code}" -X POST ${API_URL}/api/applications/job/$JOB_ID/apply \
    -H "Authorization: Bearer ${S_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{\"coverLetter\":\"Applying after JPA lifecycle audit.\",\"resumePath\":\"audit_resume.pdf\"}")
  report_row "/api/applications/job/apply" "POST" "$CODE_APPLY" "$([ "$CODE_APPLY" == "200" ] || [ "$CODE_APPLY" == "201" ] && echo "✅ SUCCESS" || echo "❌ FAILED")"
fi

