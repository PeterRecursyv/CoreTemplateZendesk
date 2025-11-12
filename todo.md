# Vendor Marketplace Template - TODO

## Completed Features
- [x] Database schema with purchases table
- [x] Hub vendor configuration (Zendesk)
- [x] All 22 spoke integrations configured
- [x] Multi-step purchase wizard (4 steps)
- [x] Pricing tiers (Hourly $400, 15min $600, 10min $700, 5min $750)
- [x] Email notifications on each step to peter.newman@recursyv.com
- [x] Stripe payment integration setup
- [x] Recursyv branding and About Us page
- [x] Professional grid layout for integrations
- [x] Search functionality for integrations

## In Progress
- [ ] Redesign homepage with circular hub-and-spoke layout
- [ ] Replace Zendesk box with large central logo
- [ ] Arrange integration logos in circle around Zendesk
- [ ] Find and replace logos without rainbow backgrounds

## Future Enhancements
- [ ] Direct email service integration (SendGrid/AWS SES)
- [ ] Email routing configuration per hub vendor
- [ ] Additional hub vendor templates (16 more)
- [ ] Custom domain configuration



## New Design Request
- [x] Implement split layout design (Option 2)
- [x] Left side: Large Zendesk showcase with features
- [x] Right side: Scrollable integration list with clean cards
- [x] Improve logo quality and spacing



## Purchase Flow Updates
- [x] Update Step 2: Remove Entity Type, Sync Frequency, Expected Data Volumes
- [x] Add Plan Required field with 3 pricing tiers
- [x] 15 Minute Sync = $500/month
- [x] 5 Minute Sync = $625/month
- [x] 2 Minute Sync = $750/month
- [x] Add note about contract period (12 months) and sync interval changes



## Terms of Service Update
- [x] Replace generic terms with official Recursyv Terms of Service
- [x] Update Step 3 in purchase flow with complete ToS document



## Integration Detail Pages
- [x] Create IntegrationDetail page component
- [x] Add integration-specific content (features, use cases, benefits)
- [x] Add route for /integration/:hubId/:spokeId
- [x] Link from homepage integration cards to detail pages



## Logo Updates
- [x] Replace Datto RMM logo (remove rainbow background)
- [x] Replace Autotask logo (remove rainbow background)



## Add New ITSM Vendors
- [x] Add TOPdesk (ITSM)
- [x] Add SysAid (ITSM)
- [x] Add Xurrent (ITSM)
- [x] Add Deskpro (ITSM)
- [x] Add Alemba (ITSM)
- [x] Download logos for all new vendors
- [x] Update spoke-integrations.json
- [x] Update Zendesk hub config



## Fix Navigation Flow
- [x] Change integration card click to go to detail page (not purchase)
- [x] Remove "Learn More" button (redundant)
- [x] Button now says "View Details" and goes to integration detail page
- [x] Reviewed recursyv.com connector page for design inspiration



## Update Security Features
- [x] Change "TLS 1.3 encryption in transit" to "AES-256Bit Encryption in Transit"
- [x] Remove "AES-256 encryption at rest"
- [x] Add "No data held at rest"



## Fix About Us Page
- [x] Investigate 404 error on About Us page
- [x] Check route configuration in App.tsx - route was missing
- [x] Added /about route to App.tsx



## Update Xurrent Logo
- [x] Search for correct Xurrent logo from xurrent.com
- [x] Download and replace current logo
- [x] Update configuration file



## Clean Up About Us Page
- [x] Remove "About Recursyv" banner/heading
- [x] Simplify page layout

