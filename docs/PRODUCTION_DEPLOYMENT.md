# Production Deployment Guide

This guide covers the complete process for deploying the Islamic Dua App to production, including best practices, security considerations, and rollback procedures.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Configuration](#environment-configuration)
3. [Build Process](#build-process)
4. [Testing Procedures](#testing-procedures)
5. [Deployment Platforms](#deployment-platforms)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Rollback Procedures](#rollback-procedures)
8. [Monitoring and Logging](#monitoring-and-logging)
9. [Performance Optimization](#performance-optimization)
10. [Security Best Practices](#security-best-practices)
11. [CI/CD Pipeline](#cicd-pipeline)

---

## Pre-Deployment Checklist

Before deploying to production, ensure all items are completed:

### Code Quality

- [ ] All tests passing (`npm test`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] Code formatted (`npm run format:check`)
- [ ] TypeScript compilation successful (`npm run type-check`)
- [ ] No console errors or warnings in browser
- [ ] All features tested in staging environment

### Dependencies

- [ ] Dependencies up to date and audited (`npm audit`)
- [ ] No critical security vulnerabilities
- [ ] Lock file committed (`package-lock.json`)
- [ ] Unused dependencies removed

### Configuration

- [ ] Environment variables configured
- [ ] API keys and secrets secured
- [ ] Database migrations ready (if applicable)
- [ ] CORS settings configured
- [ ] Rate limiting configured

### Documentation

- [ ] README.md updated
- [ ] API documentation current
- [ ] Changelog updated
- [ ] Deployment notes documented

### Performance

- [ ] Bundle size optimized
- [ ] Images optimized
- [ ] Lazy loading implemented
- [ ] Code splitting configured
- [ ] Lighthouse score > 90

---

## Environment Configuration

### Required Environment Variables

Create a `.env.production` file (never commit this file):

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# API Configuration
VITE_API_BASE_URL=https://api.yourdomain.com

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_TRACKING=true

# OpenAI (if using AI features)
VITE_OPENAI_API_KEY=your-openai-key

# App Configuration
VITE_APP_ENV=production
VITE_APP_VERSION=1.0.0
```

### Environment Variable Security

> [!CAUTION]
> Never commit `.env` files containing secrets to version control!

- Use platform-specific secret management (Vercel Secrets, Netlify Environment Variables)
- Rotate API keys regularly
- Use different keys for staging and production
- Implement key rotation procedures
- Monitor API key usage

### Validation Script

Create `scripts/validate-env.js`:

```javascript
const requiredVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];

const missing = requiredVars.filter(varName => !process.env[varName]);

if (missing.length > 0) {
  console.error('❌ Missing required environment variables:');
  missing.forEach(varName => console.error(`  - ${varName}`));
  process.exit(1);
}

console.log('✅ All required environment variables are set');
```

---

## Build Process

### Production Build

```bash
# Clean previous builds
rm -rf dist

# Run validation
npm run validate

# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Build Optimization

The build process includes:

1. **TypeScript Compilation**: Type checking and transpilation
2. **Code Minification**: Reduces bundle size
3. **Tree Shaking**: Removes unused code
4. **Code Splitting**: Splits code into chunks
5. **Asset Optimization**: Compresses images and fonts
6. **Source Maps**: Generated for debugging (optional)

### Build Configuration (`vite.config.ts`)

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import compression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    compression({ algorithm: 'gzip' }),
    compression({ algorithm: 'brotliCompress', ext: '.br' }),
    visualizer({ open: false, filename: 'dist/stats.html' }),
  ],
  build: {
    target: 'es2015',
    minify: 'terser',
    sourcemap: false, // Set to true for debugging
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
```

### Bundle Analysis

After building, analyze the bundle:

```bash
# View bundle visualization
open dist/stats.html

# Check bundle sizes
ls -lh dist/assets/
```

---

## Testing Procedures

### 1. Unit Tests

```bash
npm test
```

### 2. Integration Tests

```bash
npm run test:integration
```

### 3. End-to-End Tests

```bash
npm run test:e2e
```

### 4. Manual Testing Checklist

- [ ] Authentication flow (login, logout, signup)
- [ ] All pages load correctly
- [ ] Navigation works
- [ ] Forms submit successfully
- [ ] Data persistence (local storage, database)
- [ ] Responsive design on mobile/tablet/desktop
- [ ] Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- [ ] Offline functionality (if applicable)
- [ ] Error handling and user feedback

### 5. Performance Testing

```bash
# Run Lighthouse audit
npm run lighthouse

# Check Core Web Vitals
# - Largest Contentful Paint (LCP) < 2.5s
# - First Input Delay (FID) < 100ms
# - Cumulative Layout Shift (CLS) < 0.1
```

---

## Deployment Platforms

### Vercel (Recommended)

#### Initial Setup

1. **Install Vercel CLI**:

   ```bash
   npm i -g vercel
   ```

2. **Login**:

   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

#### Configuration (`vercel.json`)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

#### Environment Variables

Set via Vercel Dashboard or CLI:

```bash
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
```

---

### Netlify

#### Deploy via CLI

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

#### Configuration (`netlify.toml`)

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

---

### Custom Server (VPS/Cloud)

#### Using Nginx

1. **Build the app**:

   ```bash
   npm run build
   ```

2. **Upload to server**:

   ```bash
   scp -r dist/* user@server:/var/www/islamic-dua-app/
   ```

3. **Nginx configuration** (`/etc/nginx/sites-available/islamic-dua-app`):

   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       root /var/www/islamic-dua-app;
       index index.html;

       # Gzip compression
       gzip on;
       gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

       # Cache static assets
       location /assets/ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }

       # SPA fallback
       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

4. **Enable site and restart Nginx**:

   ```bash
   sudo ln -s /etc/nginx/sites-available/islamic-dua-app /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

5. **Setup SSL with Let's Encrypt**:
   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```

---

## Post-Deployment Verification

### Automated Checks

```bash
# Check if site is accessible
curl -I https://yourdomain.com

# Check response time
curl -o /dev/null -s -w 'Total: %{time_total}s\n' https://yourdomain.com
```

### Manual Verification

- [ ] Site loads successfully
- [ ] No console errors
- [ ] Authentication works
- [ ] Database connections successful
- [ ] All API endpoints responding
- [ ] Analytics tracking (if enabled)
- [ ] Error tracking configured
- [ ] SSL certificate valid
- [ ] DNS configured correctly
- [ ] CDN caching working

### Health Check Endpoint

Create a health check endpoint to monitor:

```typescript
// src/pages/health.tsx
export default function HealthCheck() {
  return (
    <div>
      {JSON.stringify({
        status: 'ok',
        version: import.meta.env.VITE_APP_VERSION,
        timestamp: new Date().toISOString(),
      })}
    </div>
  );
}
```

---

## Rollback Procedures

### Vercel Rollback

```bash
# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback [deployment-url]
```

### Netlify Rollback

1. Go to Netlify Dashboard
2. Navigate to Deploys
3. Find previous successful deployment
4. Click "Publish deploy"

### Custom Server Rollback

```bash
# Keep previous builds
mv dist dist-backup-$(date +%Y%m%d-%H%M%S)

# Restore previous build
cp -r dist-backup-YYYYMMDD-HHMMSS dist

# Restart server
sudo systemctl restart nginx
```

### Database Rollback

> [!WARNING]
> Always backup database before migrations!

```bash
# Backup database
pg_dump -U postgres -d islamic_dua_app > backup-$(date +%Y%m%d).sql

# Restore if needed
psql -U postgres -d islamic_dua_app < backup-YYYYMMDD.sql
```

---

## Monitoring and Logging

### Error Tracking

#### Sentry Integration

```bash
npm install @sentry/react
```

```typescript
// src/lib/sentry.ts
import * as Sentry from '@sentry/react';

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_APP_ENV,
    tracesSampleRate: 1.0,
  });
}
```

### Analytics

#### Google Analytics 4

```typescript
// src/lib/analytics.ts
export const initAnalytics = () => {
  if (import.meta.env.VITE_ENABLE_ANALYTICS === 'true') {
    // Initialize GA4
    window.gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID);
  }
};
```

### Performance Monitoring

- **Vercel Analytics**: Automatic with Vercel deployment
- **Web Vitals**: Track Core Web Vitals
- **Custom metrics**: Track user interactions

### Logging Best Practices

```typescript
// src/lib/logger.ts
const logger = {
  info: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.log(`[INFO] ${message}`, data);
    }
  },
  error: (message: string, error?: Error) => {
    console.error(`[ERROR] ${message}`, error);
    // Send to error tracking service
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data);
  },
};
```

---

## Performance Optimization

### Code Splitting

```typescript
// Lazy load routes
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Challenges = lazy(() => import('./pages/Challenges'));

// Use Suspense
<Suspense fallback={<Loading />}>
  <Routes>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/challenges" element={<Challenges />} />
  </Routes>
</Suspense>;
```

### Image Optimization

```typescript
// Use modern formats (WebP, AVIF)
<img src="/images/hero.webp" alt="Hero" loading="lazy" decoding="async" />
```

### Caching Strategy

```typescript
// Service Worker for offline support
// vite-plugin-pwa configuration
import { VitePWA } from 'vite-plugin-pwa';

VitePWA({
  registerType: 'autoUpdate',
  workbox: {
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 300,
          },
        },
      },
    ],
  },
});
```

### Bundle Size Optimization

- Remove unused dependencies
- Use tree-shakeable libraries
- Implement code splitting
- Compress assets
- Use CDN for large libraries

---

## Security Best Practices

### Content Security Policy

```html
<!-- index.html -->
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co;"
/>
```

### Security Headers

```javascript
// vercel.json or netlify.toml
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "geolocation=(), microphone=(), camera=()" }
      ]
    }
  ]
}
```

### Environment Variable Security

- Never expose secrets in client-side code
- Use `VITE_` prefix only for public variables
- Rotate API keys regularly
- Use different keys for each environment

### Dependency Security

```bash
# Audit dependencies
npm audit

# Fix vulnerabilities
npm audit fix

# Check for outdated packages
npm outdated
```

---

## CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Staging Environment

Always test in staging before production:

```bash
# Deploy to staging
vercel

# Test staging deployment
# Run smoke tests

# Deploy to production
vercel --prod
```

---

## Deployment Checklist

### Before Deployment

- [ ] Code reviewed and approved
- [ ] All tests passing
- [ ] Staging tested
- [ ] Database migrations prepared
- [ ] Environment variables configured
- [ ] Rollback plan ready

### During Deployment

- [ ] Deploy to production
- [ ] Monitor deployment logs
- [ ] Check for errors

### After Deployment

- [ ] Verify site is accessible
- [ ] Test critical user flows
- [ ] Check error tracking
- [ ] Monitor performance metrics
- [ ] Notify team of deployment

---

## Troubleshooting

### Common Issues

**Build Failures**

- Check Node.js version compatibility
- Clear `node_modules` and reinstall
- Check for TypeScript errors
- Verify environment variables

**Runtime Errors**

- Check browser console
- Verify API endpoints
- Check CORS configuration
- Review error tracking logs

**Performance Issues**

- Analyze bundle size
- Check network requests
- Review database queries
- Optimize images

---

## Support and Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Web.dev Performance](https://web.dev/performance/)

---

## Changelog

Keep a changelog of production deployments:

```markdown
## [1.0.0] - 2024-12-08

### Added

- Initial production release
- User authentication
- Dua management
- Challenge tracking

### Changed

- Optimized bundle size
- Improved loading performance

### Fixed

- Login redirect issue
- Mobile responsive layout
```

---

> [!IMPORTANT]
> Always test thoroughly in staging before deploying to production. Have a rollback plan ready for every deployment.
