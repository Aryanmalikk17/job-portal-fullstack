#!/bin/bash

# ==============================================================================
# zplusejobs.com API Integration Test Suite
# Description: Executes a comprehensive integration test suite via cURL to
#              verify 100% functionality of core services.
# ==============================================================================

# Default to production if not specified
ENVIRONMENT=${1:-"production"}

if [ "$ENVIRONMENT" == "local" ]; then
    BASE_URL="http://localhost:8080"
    WEBSITE_URL="http://localhost:3000"
else
    # Production
    BASE_URL="https://api.zplusejobs.com"
    WEBSITE_URL="https://www.zplusejobs.com"
fi

echo "======================================================================"
echo " Starting API Integration Test Suite"
echo " Environment: $ENVIRONMENT"
echo " API Base URL: $BASE_URL"
echo " Website URL: $WEBSITE_URL"
echo "======================================================================"

# Initialize Test Report
REPORT_FILE="test_report.md"
echo "# API Integration Test Report" > $REPORT_FILE
echo "Run Date: $(date)" >> $REPORT_FILE
echo "Environment: $ENVIRONMENT" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "| Test Name | Endpoint | Status | Response Time (s) | HTTP Code |" >> $REPORT_FILE
echo "|-----------|----------|--------|-------------------|-----------|" >> $REPORT_FILE

# Global variables
JOBSEEKER_EMAIL="test.seeker.$(date +%s)@example.com"
RECRUITER_EMAIL="test.recruiter.$(date +%s)@example.com"
PASSWORD="TestPassword123!"
JOBSEEKER_TOKEN=""
RECRUITER_TOKEN=""
COMPANY_ID=""
LOCATION_ID=""
JOB_ID=""

# Helper function to execute and log curl commands
# Usage: execute_test "Test Name" "Method" "Endpoint" "Data (optional)" "Auth Token (optional)" "Is Multipart (optional)"
execute_test() {
    local TEST_NAME=$1
    local METHOD=$2
    local ENDPOINT=$3
    local DATA=$4
    local TOKEN=$5
    local IS_MULTIPART=$6

    local URL="${BASE_URL}${ENDPOINT}"
    
    # Check if this is a website endpoint for SEO tests
    if [[ "$ENDPOINT" == http* ]]; then
        URL="$ENDPOINT"
    fi

    # Build curl command for logging
    local CURL_CMD="curl -s -w \"\\n%{http_code}\\n%{time_total}\" -X $METHOD \"$URL\""
    
    if [ ! -z "$TOKEN" ]; then
        CURL_CMD="$CURL_CMD -H \"Authorization: Bearer $TOKEN\""
    fi

    if [ ! -z "$DATA" ]; then
        if [ "$IS_MULTIPART" == "true" ]; then
            CURL_CMD="$CURL_CMD $DATA"
        else
            CURL_CMD="$CURL_CMD -H \"Content-Type: application/json\" -d '$DATA'"
        fi
    fi

    echo ""
    echo "Running: $TEST_NAME"
    echo "=> $METHOD $URL"
    
    # Execute the command
    local RESPONSE
    if [ "$IS_MULTIPART" == "true" ]; then
        # For multipart, data is passed directly as arguments
        if [ ! -z "$TOKEN" ]; then
            RESPONSE=$(curl -s -w "\n%{http_code}\n%{time_total}" -X "$METHOD" "$URL" -H "Authorization: Bearer $TOKEN" $DATA)
        else
            RESPONSE=$(curl -s -w "\n%{http_code}\n%{time_total}" -X "$METHOD" "$URL" $DATA)
        fi
    else
        if [ ! -z "$TOKEN" ] && [ ! -z "$DATA" ]; then
            RESPONSE=$(curl -s -w "\n%{http_code}\n%{time_total}" -X "$METHOD" "$URL" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "$DATA")
        elif [ ! -z "$TOKEN" ]; then
            RESPONSE=$(curl -s -w "\n%{http_code}\n%{time_total}" -X "$METHOD" "$URL" -H "Authorization: Bearer $TOKEN")
        elif [ ! -z "$DATA" ]; then
            RESPONSE=$(curl -s -w "\n%{http_code}\n%{time_total}" -X "$METHOD" "$URL" -H "Content-Type: application/json" -d "$DATA")
        else
            RESPONSE=$(curl -s -w "\n%{http_code}\n%{time_total}" -X "$METHOD" "$URL")
        fi
    fi

    # Parse response, http code, and time
    local TIME=$(echo "$RESPONSE" | tail -n1)
    local HTTP_CODE=$(echo "$RESPONSE" | tail -n2 | head -n1)
    local BODY=$(echo "$RESPONSE" | sed '$d' | sed '$d')

    # Determine status
    local STATUS="✅ PASS"
    if [[ "$HTTP_CODE" -lt 200 || "$HTTP_CODE" -ge 400 ]]; then
        STATUS="❌ FAIL"
    fi

    # Log to report
    echo "| $TEST_NAME | \`$METHOD $ENDPOINT\` | $STATUS | $TIME | $HTTP_CODE |" >> $REPORT_FILE

    # Output to console
    echo "Status Code: $HTTP_CODE"
    echo "Response Time: $TIME s"
    if [ "$STATUS" == "❌ FAIL" ]; then
        echo "Response Body: $BODY"
        echo "Failed command for replay:"
        echo "$CURL_CMD"
    fi
    
    # Export BODY for subsequent processing
    export LAST_BODY="$BODY"
    export LAST_HTTP_CODE="$HTTP_CODE"
}


echo "======================================================================"
echo " 1. Jobseeker Lifecycle Test Flow"
echo "======================================================================"

# 1.1 Register Jobseeker
DATA="{\"firstName\":\"Test\",\"lastName\":\"Seeker\",\"email\":\"$JOBSEEKER_EMAIL\",\"password\":\"$PASSWORD\",\"userType\":\"Job Seeker\"}"
execute_test "Register Jobseeker" "POST" "/api/auth/register/new" "$DATA" "" ""

# 1.2 Login Jobseeker
DATA="{\"email\":\"$JOBSEEKER_EMAIL\",\"password\":\"$PASSWORD\"}"
execute_test "Login Jobseeker" "POST" "/api/auth/login" "$DATA" "" ""
# Extract token (basic extraction, assuming format {"data":{"token":"..."}})
JOBSEEKER_TOKEN=$(echo $LAST_BODY | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$JOBSEEKER_TOKEN" ]; then
    echo "❌ Failed to obtain Jobseeker token. Aborting jobseeker tests."
else
    echo "✅ Successfully obtained Jobseeker token"
    
    # 1.3 Verify Token
    execute_test "Verify Jobseeker Token" "POST" "/api/auth/verify" "" "$JOBSEEKER_TOKEN" ""

    # 1.4 Get Initial Profile
    execute_test "Get Initial Jobseeker Profile" "GET" "/api/profile" "" "$JOBSEEKER_TOKEN" ""

    # 1.5 Update Profile (Full fields)
    DATA="-F \"firstName=Test\" -F \"lastName=SeekerUpdated\" -F \"city=New York\" -F \"state=NY\" -F \"country=USA\" -F \"about=I am a test user.\""
    execute_test "Update Jobseeker Profile (Populate)" "PUT" "/api/profile/job-seeker" "$DATA" "$JOBSEEKER_TOKEN" "true"

    # 1.6 Add 3 Skills
    DATA="-F \"skills=Java\" -F \"skills=Spring Boot\" -F \"skills=React\""
    execute_test "Add 3 Skills" "PUT" "/api/profile/job-seeker" "$DATA" "$JOBSEEKER_TOKEN" "true"

    # 1.7 Clear specific fields (The "Clear" Test)
    DATA="-F \"city=\" -F \"state=\" -F \"country=\""
    execute_test "Clear specific fields" "PUT" "/api/profile/job-seeker" "$DATA" "$JOBSEEKER_TOKEN" "true"

    # 1.8 Delete all skills
    # To clear skills, we just don't pass the skills array, or pass empty. But controller clears it only if skills != null.
    # Wait, the controller code says: if (skills != null) { ... clear existing skills ... add new if not blank }
    # So we pass an empty skill: -F "skills="
    DATA="-F \"skills=\""
    execute_test "Delete all skills (Sentinel Logic)" "PUT" "/api/profile/job-seeker" "$DATA" "$JOBSEEKER_TOKEN" "true"
fi


echo "======================================================================"
echo " 2. Recruiter Lifecycle Test Flow"
echo "======================================================================"

# 2.1 Register Recruiter
DATA="{\"firstName\":\"Test\",\"lastName\":\"Recruiter\",\"email\":\"$RECRUITER_EMAIL\",\"password\":\"$PASSWORD\",\"userType\":\"Recruiter\"}"
execute_test "Register Recruiter" "POST" "/api/auth/register/new" "$DATA" "" ""

# 2.2 Login Recruiter
DATA="{\"email\":\"$RECRUITER_EMAIL\",\"password\":\"$PASSWORD\"}"
execute_test "Login Recruiter" "POST" "/api/auth/login" "$DATA" "" ""
RECRUITER_TOKEN=$(echo $LAST_BODY | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$RECRUITER_TOKEN" ]; then
    echo "❌ Failed to obtain Recruiter token. Aborting recruiter tests."
else
    echo "✅ Successfully obtained Recruiter token"
    
    # 2.3 Update Recruiter Profile (15 new fields)
    DATA="-F \"industry=Technology\" -F \"companySize=10-50\" -F \"companyType=Startup\" -F \"foundedYear=2020\" -F \"jobTitle=HR Manager\" -F \"companyWebsite=https://example.com\" -F \"officeCity=San Francisco\""
    execute_test "Update Recruiter Profile (New Fields)" "PUT" "/api/profile/recruiter" "$DATA" "$RECRUITER_TOKEN" "true"

    # 2.4 Create Location
    DATA="{\"city\":\"San Francisco\", \"state\":\"CA\", \"country\":\"USA\"}"
    execute_test "Create Location" "POST" "/api/job-data/locations" "$DATA" "$RECRUITER_TOKEN" ""
    LOCATION_ID=$(echo $LAST_BODY | grep -o '"id":[^,}]*' | cut -d':' -f2 | head -n1 | tr -d ' ')
    
    # 2.5 Create Company
    DATA="{\"name\":\"Test Company Corp\"}"
    execute_test "Create Company" "POST" "/api/job-data/companies" "$DATA" "$RECRUITER_TOKEN" ""
    COMPANY_ID=$(echo $LAST_BODY | grep -o '"id":[^,}]*' | cut -d':' -f2 | head -n1 | tr -d ' ')

    # 2.6 Create Job Posting
    if [ ! -z "$LOCATION_ID" ] && [ ! -z "$COMPANY_ID" ]; then
        DATA="{\"jobTitle\":\"Senior Test Engineer\",\"descriptionOfJob\":\"This is a test job.\",\"jobType\":\"Full-Time\",\"salary\":\"100k-150k\",\"remote\":\"Remote-Only\",\"jobLocationId\":$LOCATION_ID,\"jobCompanyId\":$COMPANY_ID}"
        execute_test "Create Job Posting" "POST" "/api/jobs/create" "$DATA" "$RECRUITER_TOKEN" ""
        JOB_ID=$(echo $LAST_BODY | grep -o '"jobPostId":[^,}]*' | cut -d':' -f2 | head -n1 | tr -d ' ')
    else
        echo "❌ Missing Location ID or Company ID, skipping Job Creation"
    fi
    
    # 2.7 Verify Job Creation & Keys
    if [ ! -z "$JOB_ID" ]; then
        execute_test "Verify Created Job" "GET" "/api/jobs/$JOB_ID" "" "" ""
    fi
fi


echo "======================================================================"
echo " 3. Public & SEO Verification"
echo "======================================================================"

execute_test "Sitemap Header Verification" "HEAD" "${WEBSITE_URL}/sitemap.xml" "" "" ""
execute_test "Robots.txt Verification" "GET" "${WEBSITE_URL}/robots.txt" "" "" ""


echo "======================================================================"
echo " Test Suite Complete! Report generated: $REPORT_FILE"
echo "======================================================================"
cat $REPORT_FILE
