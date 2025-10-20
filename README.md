# Vendor Integration Marketplace Template

A reusable, configurable marketplace template for showcasing vendor integrations using a **hub-and-spoke model**. Built with React 19, TypeScript, tRPC, and Stripe.

## 🎯 Quick Overview

This template allows you to create individual vendor marketplace apps focused on showcasing integrations for a specific "hub" vendor to other "spoke" apps. Simply change the hub vendor configuration to create a new marketplace instance.

**Current Demo:** Zendesk marketplace with 8 integrations (ServiceNow, Freshservice, Jira, Salesforce, HubSpot, Autotask, ConnectWise, NinjaOne)

## ✨ Key Features

- **🔄 Hub-and-Spoke Model:** Configurable central vendor with filtered spoke integrations
- **🛒 Multi-Step Purchase Flow:** 4-step wizard with validation and pricing recommendations
- **💳 Stripe Integration:** Secure subscription-based payment processing
- **📧 Email Notifications:** Automatic purchase notifications with log file generation
- **🎨 Easy Rebranding:** JSON-based configuration for logos, colors, and contact info
- **📱 Responsive Design:** Mobile-first UI with modern shadcn/ui components
- **🔒 Secure:** Built-in authentication, encrypted data transmission, HTTPS-ready

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Configure environment variables
# Set STRIPE_SECRET_KEY, VITE_STRIPE_PUBLISHABLE_KEY, etc.

# Push database schema
pnpm db:push

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the marketplace.

## 🔧 Change Hub Vendor

### Option 1: Environment Variable
```bash
export TEMPLATE_HUB_VENDOR=servicenow
```

### Option 2: Create New Configuration
1. Create `config/hub-vendors/{vendor-id}.json`
2. Add logo to `client/public/assets/logos/`
3. Set `TEMPLATE_HUB_VENDOR` environment variable
4. Restart application

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

## 📁 Configuration Files

| File | Purpose |
|------|---------|
| `config/hub-vendors/{id}.json` | Hub vendor details, features, and available integrations |
| `config/spoke-integrations.json` | All available spoke integrations |
| `config/branding.json` | Company branding, logos, contact information |
| `config/pricing.json` | Pricing tiers and features |

## 🛠️ Technology Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS 4, shadcn/ui
- **Backend:** Express 4, tRPC 11, Node.js 22
- **Database:** MySQL/TiDB with Drizzle ORM
- **Payment:** Stripe
- **Authentication:** Manus OAuth
- **Deployment:** Manus Platform (or any Node.js host)

## 📊 Database Schema

### Purchases Table
Tracks complete purchase flow from integration selection to payment:
- Customer information (name, email, company)
- Integration details (hub, spoke)
- Business requirements (entity type, sync frequency, data volume)
- Pricing tier selection
- Terms acceptance
- Stripe session and payment status
- Notification tracking

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for complete schema documentation.

## 🎨 Customization

### Update Branding
Edit `config/branding.json`:
```json
{
  "companyName": "Your Company",
  "logo": "/assets/logos/your-logo.png",
  "contactEmail": "contact@yourcompany.com",
  "aboutUs": "Your company description..."
}
```

### Modify Pricing
Edit `config/pricing.json` to add/modify pricing tiers with automatic recommendations based on customer requirements.

### Add New Integrations
Edit `config/spoke-integrations.json` and add to hub vendor's `spokeIntegrations` array.

## 📧 Email Notifications

Purchase notifications are automatically sent to `info@recursyv.com` (configurable via `NOTIFICATION_EMAIL` environment variable).

Each purchase generates:
- Email notification with full order details
- Log file in `logs/purchases/`
- Database record with tracking information

## 💳 Stripe Setup

1. Create Stripe account at [stripe.com](https://stripe.com)
2. Get API keys from Dashboard
3. Set environment variables:
   ```bash
   export STRIPE_SECRET_KEY=sk_test_...
   export VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```
4. Test with card: `4242 4242 4242 4242`

## 🌐 Deployment

### Manus Platform (Recommended)
1. Click "Publish" in Manus UI
2. Configure environment variables
3. Deploy

### Manual Deployment
```bash
pnpm build
# Deploy to Vercel, Netlify, Railway, etc.
```

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for complete deployment instructions.

## 📖 Documentation

- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Complete deployment and configuration guide
- **[Architecture Design](./architecture-design.md)** - System architecture and data flow
- **[Research Notes](./research_notes.md)** - Reference website analysis

## 🔐 Environment Variables

### Required (Auto-injected by Manus)
- `DATABASE_URL` - Database connection string
- `JWT_SECRET` - Session signing secret
- `VITE_APP_ID` - OAuth application ID
- `BUILT_IN_FORGE_API_KEY` - Manus API key

### Additional Required
- `STRIPE_SECRET_KEY` - Stripe secret key
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret

### Optional
- `TEMPLATE_HUB_VENDOR` - Hub vendor ID (default: zendesk)
- `NOTIFICATION_EMAIL` - Purchase notification email (default: info@recursyv.com)

## 🎯 Use Cases

1. **Create Zendesk Marketplace** - Showcase Zendesk integrations
2. **Create ServiceNow Marketplace** - Showcase ServiceNow integrations
3. **Create Jira Marketplace** - Showcase Jira integrations
4. **Create Salesforce Marketplace** - Showcase Salesforce integrations

Simply change the hub vendor configuration and deploy!

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Loading marketplace..." stuck | Check browser console, verify database connection |
| Stripe button disabled | Verify Stripe API keys are set |
| Notifications not sending | Check `BUILT_IN_FORGE_API_KEY` configuration |
| Wrong hub vendor | Check `TEMPLATE_HUB_VENDOR` environment variable |

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for more troubleshooting tips.

## 📞 Support

- **Email:** info@recursyv.com
- **Phone (UK):** +44 118 380 0142
- **Phone (US):** +1 833 749 3781
- **Address:** Recursyv Limited, 400 Thames Valley Park Drive, Reading, RG6 1PT

## 📄 License

Proprietary software. Contact Recursyv for licensing information.

---

**Built with ❤️ by Recursyv** - Leaders in ITSM, Service Desk and Help Desk Integrations

