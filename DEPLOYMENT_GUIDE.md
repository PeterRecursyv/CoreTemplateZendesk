# Vendor Marketplace Template - Deployment Guide

## Overview

This is a reusable vendor marketplace template built with a **hub-and-spoke model**. It showcases integrations between a central "hub" vendor platform and multiple "spoke" integration partners. The template is designed to be easily rebranded and reconfigured for different hub vendors.

**Current Demo Configuration:** Zendesk as the hub vendor with 8 spoke integrations

---

## Key Features

### 1. Hub-and-Spoke Architecture
- **Configurable Hub Vendor:** Change the central platform by editing configuration files
- **Dynamic Spoke Integrations:** Automatically filters available integrations based on hub vendor
- **Easy Rebranding:** Update logos, colors, and contact information through JSON configuration

### 2. Multi-Step Purchase Flow
- **Step 1:** Integration selection and customer contact information
- **Step 2:** Business details, requirements, and automatic pricing tier recommendation
- **Step 3:** Terms and conditions acceptance
- **Step 4:** Stripe payment processing

### 3. Stripe Payment Integration
- Secure checkout session creation
- Subscription-based pricing model
- Payment status tracking
- Success/cancel URL handling

### 4. Email Notifications
- Automatic notification to `info@recursyv.com` (configurable per template)
- Purchase log file generation
- Detailed customer and order information
- Integration with Manus notification system

### 5. Branding System
- Recursyv branding with logo and contact details
- About Us page with company information
- Customizable color scheme
- Professional footer with contact information

---

## Quick Start

### Prerequisites
- Node.js 22.x
- MySQL/TiDB database
- Stripe account (for payment processing)
- Environment variables configured

### Installation

1. **Clone or download the project**
   ```bash
   cd vendor-marketplace-template
   pnpm install
   ```

2. **Configure environment variables**
   
   Required variables (auto-injected in Manus platform):
   - `DATABASE_URL` - MySQL connection string
   - `JWT_SECRET` - Session signing secret
   - `VITE_APP_ID` - OAuth application ID
   - `OAUTH_SERVER_URL` - OAuth backend URL
   - `VITE_OAUTH_PORTAL_URL` - OAuth portal URL
   - `OWNER_OPEN_ID`, `OWNER_NAME` - Owner identity
   - `VITE_APP_TITLE` - Application title
   - `VITE_APP_LOGO` - Application logo URL
   - `BUILT_IN_FORGE_API_URL` - Manus API URL
   - `BUILT_IN_FORGE_API_KEY` - Manus API key

   Additional required variables:
   - `STRIPE_SECRET_KEY` - Your Stripe secret key
   - `VITE_STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key
   - `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
   - `NOTIFICATION_EMAIL` - Email for purchase notifications (default: info@recursyv.com)
   - `TEMPLATE_HUB_VENDOR` - Hub vendor ID (default: zendesk)

3. **Push database schema**
   ```bash
   pnpm db:push
   ```

4. **Start development server**
   ```bash
   pnpm dev
   ```

5. **Access the application**
   - Open `http://localhost:3000` in your browser

---

## Changing the Hub Vendor

### Method 1: Environment Variable (Recommended)

Set the `TEMPLATE_HUB_VENDOR` environment variable to the desired vendor ID:

```bash
export TEMPLATE_HUB_VENDOR=servicenow
```

### Method 2: Create New Hub Vendor Configuration

1. **Create a new hub vendor configuration file**
   
   Create `config/hub-vendors/{vendor-id}.json`:

   ```json
   {
     "id": "servicenow",
     "name": "ServiceNow",
     "description": "Enterprise service management solution",
     "logo": "/assets/logos/servicenow-logo.png",
     "categories": ["ITSM", "Enterprise"],
     "dataPoints": [
       "Incidents",
       "Service Requests",
       "Change Requests",
       "Configuration Items",
       "Users",
       "Groups"
     ],
     "features": [
       "Bidirectional sync",
       "Real-time updates",
       "Custom field mapping",
       "Webhook support"
     ],
     "spokeIntegrations": [
       "zendesk",
       "jira",
       "salesforce",
       "freshservice"
     ]
   }
   ```

2. **Add the vendor logo**
   
   Place the logo file in `client/public/assets/logos/{vendor-id}-logo.png`

3. **Update spoke integrations**
   
   Edit `config/spoke-integrations.json` to add or modify available integrations

4. **Set environment variable**
   ```bash
   export TEMPLATE_HUB_VENDOR=servicenow
   ```

5. **Restart the application**

---

## Updating Branding

Edit `config/branding.json`:

```json
{
  "companyName": "Your Company Name",
  "logo": "/assets/logos/your-logo.png",
  "contactEmail": "contact@yourcompany.com",
  "contactPhoneUK": "+44 XXX XXX XXXX",
  "contactPhoneUS": "+1 XXX XXX XXXX",
  "address": "Your Company Address",
  "aboutUs": "Your company description...",
  "tagline": "Your tagline",
  "colors": {
    "primary": "#003366",
    "accent": "#FF6B6B",
    "background": "#F8F9FA"
  },
  "social": {
    "twitter": "https://twitter.com/yourcompany",
    "linkedin": "https://linkedin.com/company/yourcompany"
  }
}
```

**Important:** Add your logo to `client/public/assets/logos/` and reference it in the configuration.

---

## Configuring Pricing Tiers

Edit `config/pricing.json` to customize pricing plans:

```json
{
  "tiers": [
    {
      "id": "starter",
      "name": "Starter",
      "description": "Perfect for small teams",
      "price": 299,
      "currency": "USD",
      "interval": "month",
      "features": [
        "Feature 1",
        "Feature 2"
      ],
      "criteria": {
        "dataVolume": "small",
        "syncFrequency": ["hourly", "daily"]
      }
    }
  ]
}
```

The pricing tier is automatically recommended based on:
- **Data Volume:** small, medium, large
- **Sync Frequency:** realtime, hourly, daily

---

## Stripe Integration Setup

### 1. Create Stripe Account
- Sign up at [stripe.com](https://stripe.com)
- Get your API keys from the Dashboard

### 2. Configure Environment Variables
```bash
export STRIPE_SECRET_KEY=sk_test_...
export VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 3. Set Up Webhook (Optional)
For production, configure a webhook endpoint:
- URL: `https://yourdomain.com/api/stripe/webhook`
- Events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`

### 4. Test Payment Flow
1. Navigate to an integration and click "Get Started"
2. Complete the multi-step form
3. Click "Proceed to Stripe Checkout"
4. Use Stripe test card: `4242 4242 4242 4242`

---

## Email Notifications

### How It Works
When a purchase reaches Step 4 (Payment), the system:
1. Creates a purchase log file in `logs/purchases/`
2. Sends a notification to the configured email address
3. Includes all customer and order details
4. Marks the notification as sent in the database

### Configuring Notification Email
Set the `NOTIFICATION_EMAIL` environment variable:
```bash
export NOTIFICATION_EMAIL=sales@yourcompany.com
```

Default: `info@recursyv.com`

### Template-Specific Emails
To use different emails for different hub vendors, modify `server/email-notification.ts`:

```typescript
export function getNotificationEmail(templateId: string): string {
  const emailMap: Record<string, string> = {
    'zendesk': 'zendesk-sales@yourcompany.com',
    'servicenow': 'servicenow-sales@yourcompany.com',
  };
  return emailMap[templateId] || process.env.NOTIFICATION_EMAIL || 'info@recursyv.com';
}
```

---

## Database Schema

### Users Table
Standard authentication table (managed by template)

### Purchases Table
Tracks the entire purchase flow:

| Field | Type | Description |
|-------|------|-------------|
| `id` | varchar(64) | Unique purchase ID |
| `hubVendorId` | varchar(64) | Hub vendor identifier |
| `hubVendorName` | varchar(255) | Hub vendor display name |
| `spokeIntegrationId` | varchar(64) | Spoke integration identifier |
| `spokeIntegrationName` | varchar(255) | Spoke integration display name |
| `customerName` | varchar(255) | Customer full name |
| `customerEmail` | varchar(320) | Customer email address |
| `companyName` | varchar(255) | Customer company name |
| `entityType` | varchar(64) | Business entity type |
| `syncFrequency` | varchar(64) | Desired sync frequency |
| `dataVolume` | varchar(64) | Expected data volume |
| `pricingTier` | varchar(64) | Selected pricing tier |
| `additionalNotes` | text | Customer notes |
| `termsAccepted` | varchar(10) | Terms acceptance flag |
| `termsAcceptedAt` | timestamp | Terms acceptance timestamp |
| `stripeSessionId` | varchar(255) | Stripe checkout session ID |
| `paymentStatus` | enum | pending, completed, failed |
| `paymentAmount` | varchar(20) | Payment amount |
| `paymentCurrency` | varchar(10) | Payment currency |
| `paidAt` | timestamp | Payment completion timestamp |
| `templateId` | varchar(64) | Template/hub vendor ID |
| `notificationEmailSent` | varchar(10) | Email sent flag |
| `logFilePath` | varchar(512) | Purchase log file path |

---

## File Structure

```
vendor-marketplace-template/
├── client/
│   ├── public/
│   │   └── assets/
│   │       └── logos/          # Logo files
│   └── src/
│       ├── pages/
│       │   ├── Home.tsx        # Marketplace homepage
│       │   ├── About.tsx       # About Us page
│       │   ├── Purchase.tsx    # Multi-step purchase flow
│       │   └── PurchaseSuccess.tsx  # Payment success page
│       └── components/         # Reusable UI components
├── server/
│   ├── routers.ts             # tRPC API routes
│   ├── db.ts                  # Database queries
│   ├── config-loader.ts       # Configuration file loader
│   ├── stripe-integration.ts  # Stripe payment logic
│   └── email-notification.ts  # Email notification logic
├── config/
│   ├── hub-vendors/           # Hub vendor configurations
│   │   └── zendesk.json
│   ├── spoke-integrations.json # All available integrations
│   ├── branding.json          # Company branding
│   └── pricing.json           # Pricing tiers
├── drizzle/
│   └── schema.ts              # Database schema
└── shared/
    └── config-types.ts        # TypeScript types for configs
```

---

## Creating Derivative Templates

### Example: Creating a "Jira Marketplace"

1. **Create Jira hub configuration**
   ```bash
   cp config/hub-vendors/zendesk.json config/hub-vendors/jira.json
   ```

2. **Edit the configuration**
   ```json
   {
     "id": "jira",
     "name": "Jira",
     "description": "Project and issue tracking software",
     "logo": "/assets/logos/jira-logo.png",
     "spokeIntegrations": [
       "zendesk",
       "servicenow",
       "salesforce",
       "github"
     ]
   }
   ```

3. **Add Jira logo**
   ```bash
   # Download or create jira-logo.png
   cp jira-logo.png client/public/assets/logos/
   ```

4. **Set environment variable**
   ```bash
   export TEMPLATE_HUB_VENDOR=jira
   ```

5. **Deploy**
   - The application will now show Jira as the hub
   - Only integrations listed in `spokeIntegrations` will appear
   - All branding and functionality remains the same

---

## Deployment

### Option 1: Manus Platform (Recommended)
The template is designed to work seamlessly with the Manus platform:
1. Click the "Publish" button in the Manus UI
2. Configure deployment settings
3. Set environment variables
4. Deploy

### Option 2: Manual Deployment

1. **Build the application**
   ```bash
   pnpm build
   ```

2. **Set production environment variables**

3. **Deploy to your hosting provider**
   - Vercel, Netlify, Railway, etc.
   - Ensure Node.js 22.x runtime
   - Configure database connection
   - Set all required environment variables

4. **Configure Stripe webhook**
   - Point to your production domain
   - Update `STRIPE_WEBHOOK_SECRET`

---

## Security Considerations

1. **Environment Variables**
   - Never commit `.env` files to version control
   - Use secure secret management in production
   - Rotate secrets regularly

2. **Database**
   - Use strong database passwords
   - Enable SSL/TLS for database connections
   - Regular backups

3. **Stripe**
   - Use Stripe's test mode during development
   - Validate webhook signatures
   - Monitor for suspicious activity

4. **Email Notifications**
   - Sanitize user input in email content
   - Rate limit notification sending
   - Monitor for spam/abuse

---

## Troubleshooting

### Issue: "Loading marketplace..." stuck on screen
**Solution:** Check browser console for API errors. Ensure database is connected and configuration files exist.

### Issue: Stripe checkout button disabled
**Solution:** Verify `STRIPE_SECRET_KEY` and `VITE_STRIPE_PUBLISHABLE_KEY` are set correctly.

### Issue: Email notifications not sending
**Solution:** Check `BUILT_IN_FORGE_API_KEY` is configured. Review server logs for notification errors.

### Issue: Wrong hub vendor displayed
**Solution:** Check `TEMPLATE_HUB_VENDOR` environment variable. Ensure corresponding JSON file exists in `config/hub-vendors/`.

### Issue: Integrations not showing
**Solution:** Verify the hub vendor's `spokeIntegrations` array includes the integration IDs. Check `config/spoke-integrations.json` for available integrations.

---

## Support

For questions or issues:
- **Email:** info@recursyv.com
- **Phone (UK):** +44 118 380 0142
- **Phone (US):** +1 833 749 3781

---

## License

This template is proprietary software. Contact Recursyv for licensing information.

---

## Changelog

### Version 1.0.0 (Initial Release)
- Hub-and-spoke marketplace architecture
- Multi-step purchase flow with validation
- Stripe payment integration
- Email notification system
- Configurable branding
- Zendesk demo configuration with 8 spoke integrations
- About Us page
- Responsive design
- Database-backed purchase tracking

