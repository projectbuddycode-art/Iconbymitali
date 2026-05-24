# Icon by Mitali - New Architecture (Supabase + Vercel)

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Vercel)                        │
│  React + Vite + Tailwind CSS + Radix UI Components        │
│                                                              │
│  Pages:                  Components:                         │
│  - Home                 - Product Card                       │
│  - Shop                 - Quick View Modal                   │
│  - Blog                 - Wishlist                           │
│  - Cart                 - Order Tracking                     │
│  - Checkout             - Admin Dashboard                    │
│  - Track Order                                              │
│  - Admin                                                     │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ HTTP/HTTPS
                   │
        ┌──────────┴──────────┐
        │                     │
    ┌───▼────────────────┐   │
    │  Supabase Edge     │   │
    │   Functions        │   │
    │                    │   │
    │ - Razorpay Ops    │   │
    │ - Shiprocket Ops  │   │
    └──────────┬─────────┘   │
               │              │
               │         ┌────▼─────────────────────┐
               │         │  Supabase Database       │
               │         │  (PostgreSQL)            │
               │         │                          │
               └────────►│ Tables:                  │
                         │ - orders                 │
                         │ - products               │
                         │ - blog_posts             │
                         │ - page_settings          │
                         │ - user_profiles          │
                         │                          │
                         │ Storage:                 │
                         │ - Product images         │
                         │ - Blog images            │
                         └──────────────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
            ┌───────▼──────┐     ┌───────▼──────┐
            │  Razorpay    │     │ Shiprocket   │
            │  Payments    │     │ Shipping     │
            └──────────────┘     └──────────────┘
```

## Data Flow

### 1. Product Listing
```
Frontend → Supabase Query
           ↓
        Products Table
           ↓
        Return JSON
           ↓
Frontend (React Components)
```

### 2. Payment Processing
```
Frontend (Checkout)
    ↓
Create Razorpay Order
    ↓
Edge Function: razorpay-create-order
    ↓
Razorpay API
    ↓
Return Order ID
    ↓
Display Razorpay Modal
    ↓
User Pays
    ↓
Verify Payment
    ↓
Edge Function: razorpay-verify-payment
    ↓
Database: Create Order Record
    ↓
Edge Function: shiprocket-create-order
    ↓
Shiprocket API: Create Shipment
    ↓
Database: Update Order with Shipment ID
    ↓
Return Success to Frontend
```

### 3. Order Tracking
```
Frontend (TrackOrder page)
    ↓
Get Shipment Details
    ↓
Edge Function: get-shipment-details
    ↓
Database: Query Order Record
    ↓
Return Order & Tracking Info
    ↓
Display to User
```

## Technology Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Radix UI** - Component library
- **React Router** - Navigation
- **React Query** - Data fetching
- **Framer Motion** - Animations

### Backend
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Database
- **Edge Functions (Deno)** - Serverless functions
- **TypeScript** - Type safety

### External Services
- **Razorpay** - Payment processing
- **Shiprocket** - Shipping & logistics
- **Vercel** - Hosting & CDN

### Storage
- **Supabase Storage** - File hosting for images

## Database Schema

### Orders Table
```
id (BIGINT) - Primary key
order_number (VARCHAR) - Unique order identifier
customer_name (VARCHAR) - Customer name
customer_email (VARCHAR) - Customer email
customer_phone (VARCHAR) - Customer phone
billing_address (JSONB) - Billing address
shipping_address (JSONB) - Shipping address
items (JSONB) - Array of items
total_amount (DECIMAL) - Total price
razorpay_order_id (VARCHAR) - Razorpay order ID
razorpay_payment_id (VARCHAR) - Razorpay payment ID
shipment_id (VARCHAR) - Shiprocket shipment ID
status (VARCHAR) - Order status
tracking_details (JSONB) - Shipping tracking info
created_at (TIMESTAMP) - Creation timestamp
```

### Products Table
```
id (BIGINT) - Primary key
name (VARCHAR) - Product name
description (TEXT) - Product description
price (DECIMAL) - Product price
sku (VARCHAR) - Stock keeping unit
category (VARCHAR) - Product category
images (JSONB) - Array of image URLs
show_in_lookbook (BOOLEAN) - Display in lookbook
stock_quantity (INTEGER) - Available stock
created_at (TIMESTAMP) - Creation timestamp
```

### Blog Posts Table
```
id (BIGINT) - Primary key
title (VARCHAR) - Post title
slug (VARCHAR) - URL-friendly slug
content (TEXT) - Post content
author (VARCHAR) - Author name
featured_image (VARCHAR) - Featured image URL
excerpt (TEXT) - Short excerpt
published (BOOLEAN) - Publication status
created_at (TIMESTAMP) - Creation timestamp
```

### Page Settings Table
```
id (BIGINT) - Primary key
page_name (VARCHAR) - Page identifier
settings (JSONB) - Page settings/configuration
created_at (TIMESTAMP) - Creation timestamp
```

## Edge Functions Overview

| Function | Input | Output | Purpose |
|----------|-------|--------|---------|
| razorpay-create-order | `{ amount }` | `{ order_id, key_id }` | Creates Razorpay order |
| razorpay-verify-payment | Payment data | `{ verified, order_id }` | Verifies payment signature |
| razorpay-webhook | Webhook payload | `{ received }` | Handles Razorpay events |
| shiprocket-create-order | `{ orderId }` | `{ shipment_id }` | Creates shipment |
| shiprocket-track | `{ shipmentId }` | `{ tracking }` | Gets tracking details |
| get-shipment-details | `{ orderId }` | `{ order, tracking }` | Fetches order details |

## Security Features

### Authentication & Authorization
- Row Level Security (RLS) for database access
- Service role for sensitive operations
- Public/private endpoints for different data types
- CORS policies on Edge Functions

### API Security
- Environment variables for secrets
- HMAC signature verification for webhooks
- Rate limiting on Edge Functions
- HTTPS only communication

### Data Protection
- Database backups in Supabase
- Encryption at rest and in transit
- PCI compliance through Razorpay
- GDPR compliance ready

## Performance Optimizations

### Frontend
- **Code Splitting** - Lazy load pages
- **Image Optimization** - WebP with fallbacks
- **Caching** - React Query caching
- **CDN** - Vercel global CDN
- **Minification** - Built-in Vite minification

### Backend
- **Database Indexing** - On frequently queried fields
- **Edge Functions** - Closest geographic region
- **Caching Headers** - HTTP caching
- **Query Optimization** - Efficient SQL

## Deployment Pipeline

```
Git Push (main branch)
    ↓
GitHub Webhook → Vercel
    ↓
Install Dependencies (npm install)
    ↓
Run Build (npm run build)
    ↓
Run Tests/Lint
    ↓
Deploy to CDN
    ↓
Update Preview URL
    ↓
Health Check
    ↓
Production Live
```

## Environment Variables

### Frontend (Vercel)
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_RAZORPAY_KEY_ID
VITE_API_BASE_URL
```

### Edge Functions (Supabase Secrets)
```
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET
SHIPROCKET_TOKEN
```

## Cost Estimation

### Monthly Costs
- **Vercel**: ~$20-50 (Pro plan or usage)
- **Supabase**: Free tier or ~$25+ (depending on usage)
- **Razorpay**: 2% transaction fee
- **Shiprocket**: Variable per shipment

## Monitoring & Analytics

### Tools
- **Vercel Analytics** - Web vitals, performance
- **Supabase Dashboard** - Database metrics
- **Supabase Realtime** - Live updates (optional)
- **Error Tracking** - Sentry or LogRocket

## Future Enhancements

1. **User Authentication** - Email/OAuth signup
2. **Wishlist Sync** - Save to database instead of localStorage
3. **Order History** - User dashboard with past orders
4. **Reviews & Ratings** - Customer feedback system
5. **Admin Panel** - Full CRUD operations
6. **Email Notifications** - Order & shipping updates
7. **Analytics** - Sales, traffic, conversion metrics
8. **Inventory Management** - Stock tracking
9. **Discount Codes** - Coupon system
10. **Multi-currency** - International support

## Disaster Recovery

### Backups
- Daily Supabase backups (included)
- Git repository on GitHub
- Static assets on Vercel CDN

### Recovery Process
1. Restore database from Supabase backup
2. Redeploy from Git on Vercel
3. Verify data integrity
4. Update DNS if needed

## Support & Maintenance

### Regular Tasks
- Monitor error logs weekly
- Update dependencies monthly
- Review analytics monthly
- Database maintenance (indexes, stats)
- Security patches immediately

### Contacts
- Supabase Support: support@supabase.com
- Vercel Support: support@vercel.com
- Razorpay Support: support@razorpay.com
- Shiprocket Support: support@shiprocket.com
