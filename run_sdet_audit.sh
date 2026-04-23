#!/bin/bash

# ==============================================================================
# SDET Full-Lifecycle API Integration Test Suite
# Output: Markdown Report
# ==============================================================================

# Use production URL or localhost
BASE_URL=${BASE_URL:-"http://localhost:8081"}
PUBLIC_URL=${PUBLIC_URL:-"https://www.zplusejobs.com"}

# Health Trigger: If argument starts with 'health', proceed automatically
if [[ "$1" == health* ]]; then
    echo "🚀 Health trigger detected! Starting automated audit..."
fi

# Unique email addresses to avoid conflicts
TS=$(date +%s)
JS_EMAIL="jobseeker_${TS}@example.com"
REC_EMAIL="recruiter_${TS}@example.com"
PASS="TestPass123!"

echo "Generating SDET Audit Report..."
echo "================================="

REPORT_FILE="sdet_audit_report.md"
cat << 'EOF' > $REPORT_FILE
# Full-Lifecycle API Integration Audit Report

## Execution Summary
* **Date**: $(date)
* **Environment**: Production (Localhost proxy)

| Endpoint | Method | Payload (Summary) | Status Code | Result |
|----------|--------|-------------------|-------------|--------|
EOF

append_report() {
    local ENDPOINT=$1
    local METHOD=$2
    local PAYLOAD_SUM=$3
    local STATUS=$4
    local RESULT=$5
    echo "| \`${ENDPOINT}\` | \`${METHOD}\` | ${PAYLOAD_SUM} | ${STATUS} | ${RESULT} |" >> $REPORT_FILE
}

# ------------------------------------------------------------------------------
# Helpers
# ------------------------------------------------------------------------------

# Robust JSON parser using Python3 (since jq is broken on this system)
get_json_val() {
    local JSON_DATA=$1
    local KEY=$2
    echo "$JSON_DATA" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('$KEY', '') if 'data' in data else data.get('$KEY', ''))" 2>/dev/null
}

# Check if JSON array is empty
is_json_array_empty() {
    local JSON_DATA=$1
    local KEY=$2
    echo "$JSON_DATA" | python3 -c "import sys, json; data=json.load(sys.stdin); arr=data.get('data', {}).get('$KEY', []) if 'data' in data else data.get('$KEY', []); print('true' if arr is None or len(arr) == 0 else 'false')" 2>/dev/null
}

# ------------------------------------------------------------------------------
# 1. Authentication & Token Management
# ------------------------------------------------------------------------------

# Register Jobseeker
echo "Registering Jobseeker: $JS_EMAIL"
JS_REG_RES=$(curl -k -s -w "\n%{http_code}" -X POST "$BASE_URL/api/auth/register/new" -H "Content-Type: application/json" -d "{\"firstName\":\"QA\",\"lastName\":\"Seeker\",\"email\":\"$JS_EMAIL\",\"password\":\"$PASS\",\"userTypeId\":2}")
JS_REG_HTTP=$(echo "$JS_REG_RES" | tail -n1)
if [ "$JS_REG_HTTP" != "201" ]; then
    echo "❌ Jobseeker Registration Failed: $JS_REG_HTTP"
    echo "Body: $(echo "$JS_REG_RES" | sed '$d')"
fi
append_report "/api/auth/register" "POST" "Jobseeker Registration" "$JS_REG_HTTP" "$( [ "$JS_REG_HTTP" == "201" ] && echo "✅ PASS" || echo "❌ FAIL" )"

# Register Recruiter
echo "Registering Recruiter: $REC_EMAIL"
REC_REG_RES=$(curl -k -s -w "\n%{http_code}" -X POST "$BASE_URL/api/auth/register/new" -H "Content-Type: application/json" -d "{\"firstName\":\"QA\",\"lastName\":\"Recruiter\",\"email\":\"$REC_EMAIL\",\"password\":\"$PASS\",\"userTypeId\":1}")
REC_REG_HTTP=$(echo "$REC_REG_RES" | tail -n1)
if [ "$REC_REG_HTTP" != "201" ]; then
    echo "❌ Recruiter Registration Failed: $REC_REG_HTTP"
    echo "Body: $(echo "$REC_REG_RES" | sed '$d')"
fi
append_report "/api/auth/register" "POST" "Recruiter Registration" "$REC_REG_HTTP" "$( [ "$REC_REG_HTTP" == "201" ] && echo "✅ PASS" || echo "❌ FAIL" )"

sleep 1

# Login Jobseeker
JS_LOGIN_RES=$(curl -k -s -w "\n%{http_code}" -X POST "$BASE_URL/api/auth/login" -H "Content-Type: application/json" -d "{\"email\":\"$JS_EMAIL\",\"password\":\"$PASS\"}")
JS_LOGIN_HTTP=$(echo "$JS_LOGIN_RES" | tail -n1)
JS_LOGIN_BODY=$(echo "$JS_LOGIN_RES" | sed '$d')
JS_TOKEN=$(python3 -c "import sys, json; data=json.loads(sys.argv[1]); print(data.get('token', ''))" "$JS_LOGIN_BODY" 2>/dev/null)

if [ "$JS_LOGIN_HTTP" == "200" ] && [ ! -z "$JS_TOKEN" ]; then
    append_report "/api/auth/login" "POST" "Jobseeker Auth" "$JS_LOGIN_HTTP" "✅ PASS"
else
    echo "❌ Jobseeker Login Failed: $JS_LOGIN_HTTP"
    echo "Body: $JS_LOGIN_BODY"
    append_report "/api/auth/login" "POST" "Jobseeker Auth" "$JS_LOGIN_HTTP" "❌ FAIL"
fi

sleep 1

# Login Recruiter
REC_LOGIN_RES=$(curl -k -s -w "\n%{http_code}" -X POST "$BASE_URL/api/auth/login" -H "Content-Type: application/json" -d "{\"email\":\"$REC_EMAIL\",\"password\":\"$PASS\"}")
REC_LOGIN_HTTP=$(echo "$REC_LOGIN_RES" | tail -n1)
REC_LOGIN_BODY=$(echo "$REC_LOGIN_RES" | sed '$d')
REC_TOKEN=$(python3 -c "import sys, json; data=json.loads(sys.argv[1]); print(data.get('token', ''))" "$REC_LOGIN_BODY" 2>/dev/null)

if [ "$REC_LOGIN_HTTP" == "200" ] && [ ! -z "$REC_TOKEN" ]; then
    append_report "/api/auth/login" "POST" "Recruiter Auth" "$REC_LOGIN_HTTP" "✅ PASS"
else
    echo "❌ Recruiter Login Failed: $REC_LOGIN_HTTP"
    echo "Body: $REC_LOGIN_BODY"
    append_report "/api/auth/login" "POST" "Recruiter Auth" "$REC_LOGIN_HTTP" "❌ FAIL"
fi

# ------------------------------------------------------------------------------
# 2. Profile Persistence Integrity (Jobseeker)
# ------------------------------------------------------------------------------

# Update Full Data
JS_UPDATE_RES=$(curl -k -s -w "\n%{http_code}" -X PUT "$BASE_URL/api/profile/job-seeker" -H "Authorization: Bearer $JS_TOKEN" -F "firstName=SDET" -F "lastName=Tester" -F "city=New York" -F "skills=Java,Python,SQL" -F "about=Dynamic bio")
JS_UPD_HTTP=$(echo "$JS_UPDATE_RES" | tail -n1)
JS_UPD_BODY=$(echo "$JS_UPDATE_RES" | sed '$d')

# Verify skills in response
SKILLS_CHECK=$(get_json_val "$JS_UPD_BODY" "skills")
if [ "$JS_UPD_HTTP" == "200" ] && [[ "$SKILLS_CHECK" == *"Java"* ]]; then
    append_report "/api/profile/job-seeker" "PUT" "Full Data + Skills" "$JS_UPD_HTTP" "✅ PASS"
else
    append_report "/api/profile/job-seeker" "PUT" "Full Data + Skills" "$JS_UPD_HTTP" "❌ FAIL (Skills:$SKILLS_CHECK)"
fi

# The Clear Test
CLEAR_RES=$(curl -k -s -w "\n%{http_code}" -X PUT "$BASE_URL/api/profile/job-seeker" -H "Authorization: Bearer $JS_TOKEN" -F "city=" -F "about=")
CLEAR_HTTP=$(echo "$CLEAR_RES" | tail -n1)
CLEAR_BODY=$(echo "$CLEAR_RES" | sed '$d')

VERIFY_GET=$(curl -k -s -X GET "$BASE_URL/api/profile" -H "Authorization: Bearer $JS_TOKEN")
CITY_VAL=$(get_json_val "$VERIFY_GET" "city")
ABOUT_VAL=$(get_json_val "$VERIFY_GET" "about")

if [ "$CLEAR_HTTP" == "200" ] && ([ -z "$CITY_VAL" ] || [ "$CITY_VAL" == "None" ]) && ([ -z "$ABOUT_VAL" ] || [ "$ABOUT_VAL" == "None" ]); then
    append_report "/api/profile/job-seeker" "PUT" "Clear city & about" "$CLEAR_HTTP" "✅ PASS"
else
    append_report "/api/profile/job-seeker" "PUT" "Clear city & about" "$CLEAR_HTTP" "❌ FAIL (City:$CITY_VAL, About:$ABOUT_VAL)"
fi

# The Skills Sentinel
SKILLS_RES=$(curl -k -s -w "\n%{http_code}" -X PUT "$BASE_URL/api/profile/job-seeker" -H "Authorization: Bearer $JS_TOKEN" -F "skills=")
SKILLS_HTTP=$(echo "$SKILLS_RES" | tail -n1)
VERIFY_SKILLS=$(curl -k -s -X GET "$BASE_URL/api/profile" -H "Authorization: Bearer $JS_TOKEN")
IS_EMPTY=$(is_json_array_empty "$VERIFY_SKILLS" "skills")

if [ "$SKILLS_HTTP" == "200" ] && [[ "$IS_EMPTY" == *"true"* ]]; then
    append_report "/api/profile/job-seeker" "PUT" "Skills Sentinel ('')" "$SKILLS_HTTP" "✅ PASS"
else
    append_report "/api/profile/job-seeker" "PUT" "Skills Sentinel ('')" "$SKILLS_HTTP" "❌ FAIL (Empty:$IS_EMPTY)"
fi

# ------------------------------------------------------------------------------
# 3. Business Logic Lifecycle (Recruiter)
# ------------------------------------------------------------------------------

# Update 15 missing fields
REC_UPDATE_RES=$(curl -k -s -w "\n%{http_code}" -X PUT "$BASE_URL/api/profile/recruiter" -H "Authorization: Bearer $REC_TOKEN" \
    -F "industry=Tech" -F "companySize=10-50" -F "companyType=Startup" -F "foundedYear=2020" \
    -F "jobTitle=HR Manager" -F "companyWebsite=https://zplusejobs.com" -F "officeCity=San Francisco" \
    -F "officeState=CA" -F "officeCountry=USA" -F "officeAddress=123 Tech Ave" \
    -F "officeZipCode=94105" -F "companyDescription=Testing automated audit" -F "phone=1234567890" \
    -F "businessPhone=0987654321" -F "businessEmail=test@zplusejobs.com")
REC_UPD_HTTP=$(echo "$REC_UPDATE_RES" | tail -n1)
REC_UPD_BODY=$(echo "$REC_UPDATE_RES" | sed '$d')

ZIP_VAL=$(get_json_val "$REC_UPD_BODY" "officeZipCode")
IND_VAL=$(get_json_val "$REC_UPD_BODY" "industry")

if [ "$REC_UPD_HTTP" == "200" ] && [ "$ZIP_VAL" == "94105" ] && [ "$IND_VAL" == "Tech" ]; then
    append_report "/api/profile/recruiter" "PUT" "15 Missing Fields" "$REC_UPD_HTTP" "✅ PASS"
else
    append_report "/api/profile/recruiter" "PUT" "15 Missing Fields" "$REC_UPD_HTTP" "❌ FAIL (Zip:$ZIP_VAL, Ind:$IND_VAL)"
fi

# Create Location
LOC_RES=$(curl -k -s -w "\n%{http_code}" -X POST "$BASE_URL/api/job-data/locations" -H "Authorization: Bearer $REC_TOKEN" -H "Content-Type: application/json" -d "{\"city\":\"San Francisco\", \"state\":\"CA\", \"country\":\"USA\"}")
LOC_HTTP=$(echo "$LOC_RES" | tail -n1)
LOC_BODY=$(echo "$LOC_RES" | sed '$d')
LOC_ID=$(python3 -c "import sys, json; data=json.loads(sys.argv[1]); print(data.get('data', {}).get('id', ''))" "$LOC_BODY" 2>/dev/null)

# Create Company
COMP_RES=$(curl -k -s -w "\n%{http_code}" -X POST "$BASE_URL/api/job-data/companies" -H "Authorization: Bearer $REC_TOKEN" -H "Content-Type: application/json" -d "{\"name\":\"Test Company $TS\"}")
COMP_HTTP=$(echo "$COMP_RES" | tail -n1)
COMP_BODY=$(echo "$COMP_RES" | sed '$d')
COMP_ID=$(python3 -c "import sys, json; data=json.loads(sys.argv[1]); print(data.get('data', {}).get('id', ''))" "$COMP_BODY" 2>/dev/null)

# Job Posting Flow
if [ ! -z "$LOC_ID" ] && [ ! -z "$COMP_ID" ]; then
    JOB_RES=$(curl -k -s -w "\n%{http_code}" -X POST "$BASE_URL/api/jobs/create" -H "Authorization: Bearer $REC_TOKEN" -H "Content-Type: application/json" -d "{\"jobTitle\":\"SDET Test\",\"descriptionOfJob\":\"QA Automated Testing\",\"jobType\":\"Full-Time\",\"salary\":\"100k\",\"remote\":\"Remote\",\"jobLocationId\":$LOC_ID,\"jobCompanyId\":$COMP_ID}")
    JOB_HTTP=$(echo "$JOB_RES" | tail -n1)
    if [ "$JOB_HTTP" == "200" ] || [ "$JOB_HTTP" == "201" ]; then
        append_report "/api/jobs/create" "POST" "Job with Loc & Comp" "$JOB_HTTP" "✅ PASS"
    else
        append_report "/api/jobs/create" "POST" "Job with Loc & Comp" "$JOB_HTTP" "❌ FAIL"
    fi
else
    append_report "/api/jobs/create" "POST" "Job with Loc & Comp" "N/A" "❌ FAIL (Missing IDs: LOC:$LOC_ID, COMP:$COMP_ID)"
fi

# ------------------------------------------------------------------------------
# 4. Critical Regression Checks
# ------------------------------------------------------------------------------

# Double-Path Ghost Check
echo "Running Double-Path Ghost Check..."
DP_RES=$(curl -k -s -w "%{http_code}" -o /dev/null "$BASE_URL/api/api/auth/login")
if [ "$DP_RES" == "404" ]; then
    append_report "Double-Path Check" "GET" "Ghost path /api/api/" "404" "✅ PASS (Not found as expected)"
else
    append_report "Double-Path Check" "GET" "Ghost path /api/api/" "$DP_RES" "⚠️ WARNING (Ghost path returned $DP_RES)"
fi

# Iterable Safety Check
echo "Running Iterable Safety Check..."
JOBS_RAW=$(curl -k -s -X GET "$BASE_URL/api/jobs")
IS_ARRAY=$(python3 -c "import sys, json; data=json.loads(sys.argv[1]); val=data.get('data') if isinstance(data, dict) and 'data' in data else data; print('true' if isinstance(val, list) else 'false')" "$JOBS_RAW" 2>/dev/null)
if [ "$IS_ARRAY" == "true" ]; then
    append_report "/api/jobs" "GET" "Iterable Check (Array)" "200" "✅ PASS"
else
    append_report "/api/jobs" "GET" "Iterable Check (Array)" "200" "❌ FAIL (Not an array)"
fi

# Recruiter Deep-Sync Check
echo "Running Recruiter Deep-Sync Check..."
NEW_IND="FinTech-$TS"
NEW_WEB="https://zpluse.com/audit-$TS"
SYNC_RES=$(curl -k -s -w "\n%{http_code}" -X PUT "$BASE_URL/api/profile/recruiter" -H "Authorization: Bearer $REC_TOKEN" -F "industry=$NEW_IND" -F "companyWebsite=$NEW_WEB")
SYNC_HTTP=$(echo "$SYNC_RES" | tail -n1)
VERIFY_SYNC=$(curl -k -s -X GET "$BASE_URL/api/profile" -H "Authorization: Bearer $REC_TOKEN")
GET_IND=$(get_json_val "$VERIFY_SYNC" "industry")
GET_WEB=$(get_json_val "$VERIFY_SYNC" "companyWebsite")

if [ "$SYNC_HTTP" == "200" ] && [ "$GET_IND" == "$NEW_IND" ] && [ "$GET_WEB" == "$NEW_WEB" ]; then
    append_report "Recruiter Deep-Sync" "PUT/GET" "Industry & Website" "$SYNC_HTTP" "✅ PASS"
else
    append_report "Recruiter Deep-Sync" "PUT/GET" "Industry & Website" "$SYNC_HTTP" "❌ FAIL (Ind:$GET_IND, Web:$GET_WEB)"
fi

# ------------------------------------------------------------------------------
# 5. Site-Wide Health Checks
# ------------------------------------------------------------------------------

# Sitemap
SITEMAP_HTTP=$(curl -k -s -o /dev/null -w "%{http_code}" -I "$PUBLIC_URL/sitemap.xml")
if [ "$SITEMAP_HTTP" == "200" ]; then
    append_report "/sitemap.xml" "GET" "Sitemap Header" "$SITEMAP_HTTP" "✅ PASS"
else
    append_report "/sitemap.xml" "GET" "Sitemap Header" "$SITEMAP_HTTP" "❌ FAIL"
fi

# Robots.txt
ROBOTS_TXT=$(curl -k -s "$PUBLIC_URL/robots.txt")
if echo "$ROBOTS_TXT" | grep -i "sitemap.*sitemap.xml"; then
    append_report "/robots.txt" "GET" "Contains Sitemap Path" "200" "✅ PASS"
else
    append_report "/robots.txt" "GET" "Contains Sitemap Path" "200" "❌ FAIL"
fi

# ------------------------------------------------------------------------------
# Output the Full cURL Logs into the Report
# ------------------------------------------------------------------------------

cat << EOF >> $REPORT_FILE

## Full cURL Logs (For Demonstration)

### 1. Profile Clearing (The Clear Test & Sentinel)
**Clear Text Fields (city, about):**
\`\`\`bash
curl -k -X PUT "https://api.zplusejobs.com/api/profile/job-seeker" \\
  -H "Authorization: Bearer <JOBSEEKER_TOKEN>" \\
  -F "city=" \\
  -F "about="
\`\`\`

**Clear All Skills (Sentinel):**
\`\`\`bash
curl -k -X PUT "https://api.zplusejobs.com/api/profile/job-seeker" \\
  -H "Authorization: Bearer <JOBSEEKER_TOKEN>" \\
  -F "skills="
\`\`\`

### 2. Job Posting Flow
**Location Creation:**
\`\`\`bash
curl -X POST "https://api.zplusejobs.com/api/job-data/locations" \\
  -H "Authorization: Bearer <RECRUITER_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{"city":"San Francisco", "state":"CA", "country":"USA"}'
\`\`\`

**Company Creation:**
\`\`\`bash
curl -X POST "https://api.zplusejobs.com/api/job-data/companies" \\
  -H "Authorization: Bearer <RECRUITER_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Test Company"}'
\`\`\`

**Job Posting Creation:**
\`\`\`bash
curl -X POST "https://api.zplusejobs.com/api/jobs/create" \\
  -H "Authorization: Bearer <RECRUITER_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{"jobTitle":"SDET Test","descriptionOfJob":"QA","jobType":"Full-Time","salary":"100k","remote":"Remote","jobLocationId":$LOC_ID,"jobCompanyId":$COMP_ID}'
\`\`\`
EOF

echo "Done! Report generated at $REPORT_FILE"
cat $REPORT_FILE

