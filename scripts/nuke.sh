#!/bin/bash

echo "🚀 Starting complete deployment..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Reset Database
echo -e "${BLUE}📊 Step 1/3: Resetting database...${NC}"
npx supabase db reset --linked
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database reset complete${NC}"
else
    echo -e "${YELLOW}⚠ Database reset failed${NC}"
    exit 1
fi
echo ""

# Step 2: Set Secrets
echo -e "${BLUE}🔐 Step 2/3: Setting Supabase secrets...${NC}"
npx supabase secrets set \
  RESEND_API_KEY=REDACTED_RESEND_API_KEY \
  GOCARDLESS_ACCESS_TOKEN=REDACTED_GOCARDLESS_ACCESS_TOKEN \
  GOCARDLESS_ENVIRONMENT=sandbox \
  GOCARDLESS_WEBHOOK_SECRET=REDACTED_GOCARDLESS_WEBHOOK_SECRET
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Secrets configured${NC}"
else
    echo -e "${YELLOW}⚠ Secrets configuration failed${NC}"
    exit 1
fi
echo ""

# Step 3: Deploy Edge Functions
echo -e "${BLUE}⚡ Step 3/3: Deploying edge functions...${NC}"
echo "Deploying create-signup..."
npx supabase functions deploy create-signup
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ create-signup deployed${NC}"
else
    echo -e "${YELLOW}⚠ create-signup deployment failed${NC}"
fi

echo "Deploying send-email..."
npx supabase functions deploy send-email
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ send-email deployed${NC}"
else
    echo -e "${YELLOW}⚠ send-email deployment failed${NC}"
fi

echo "Deploying gocardless-webhook..."
npx supabase functions deploy gocardless-webhook
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ gocardless-webhook deployed${NC}"
else
    echo -e "${YELLOW}⚠ gocardless-webhook deployment failed${NC}"
fi

echo ""
echo -e "${GREEN}✨ Deployment complete!${NC}"
echo ""
echo "🎯 Next steps:"
echo "  1. Test signup at: http://localhost:5177/join/plan"
echo "  2. Check GoCardless webhook is configured"
echo "  3. Verify email delivery in Resend dashboard"
echo ""
