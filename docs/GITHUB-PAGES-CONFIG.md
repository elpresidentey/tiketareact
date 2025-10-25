# GitHub Pages Configuration Requirements

This document outlines the specific configuration requirements for deploying the Ticket Management Application to GitHub Pages.

## Repository Configuration

### 1. GitHub Pages Settings

**Location:** Repository Settings → Pages

**Required Configuration:**
- **Source:** GitHub Actions
- **Branch:** Not applicable (using Actions)
- **Folder:** Not applicable (using Actions)

**Steps to Configure:**
1. Go to your repository on GitHub
2. Click "Settings" tab
3. Scroll down to "Pages" section
4. Under "Source", select "GitHub Actions"
5. Save the configuration

### 2. Repository Permissions

**Required Permissions:**
- **Actions:** Read and write permissions
- **Pages:** Write permissions
- **Contents:** Read permissions

**Configuration Steps:**
1. Go to Settings → Actions → General
2. Under "Workflow permissions", select:
   - "Read and write permissions"
   - Check "Allow GitHub Actions to create and approve pull requests"

### 3. Branch Protection (Recommended)

**Main Branch Protection:**
- Require status checks to pass
- Require branches to be up to date
- Require review from code owners (optional)

## Workflow Configuration

### 1. GitHub Actions Workflow File

**File Location:** `.github/workflows/deploy.yml`

**Key Configuration Sections:**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

env:
  NODE_VERSION: '18'
  CACHE_VERSION: v1

jobs:
  test:
    name: Run Tests
    runs-on: ubuntu-latest
    # Test configuration...

  build-and-deploy:
    name: Build and Deploy
    runs-on: ubuntu-latest
    needs: test
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    permissions:
      contents: read
      pages: write
      id-token: write
    
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
```

### 2. Environment Configuration

**GitHub Environment Setup:**
1. Go to Settings → Environments
2. Create environment named "github-pages"
3. Configure protection rules (optional):
   - Required reviewers
   - Wait timer
   - Deployment branches

**Environment Variables:**
- No custom environment variables required
- All configuration handled through Vite config

## Application Configuration

### 1. Vite Configuration

**File:** `vite.config.ts`

**Critical Settings:**
```typescript
export default defineConfig({
  base: './', // Use relative paths for better GitHub Pages compatibility
  build: {
    sourcemap: true,
    cssCodeSplit: true,
    minify: 'terser',
    assetsDir: 'assets',
    // GitHub Pages optimizations
  }
})
```

**Base Path Rules:**
- Use relative paths (`./`) for maximum compatibility
- Avoids issues with repository name mismatches
- Works consistently across different GitHub Pages configurations
- Simpler and more reliable than absolute paths

### 2. Router Configuration

**Required Router Type:** HashRouter

```typescript
import { HashRouter as Router } from 'react-router-dom'

function App() {
  return (
    <Router>
      {/* Application routes */}
    </Router>
  )
}
```

**Why HashRouter:**
- GitHub Pages serves static files only
- No server-side routing configuration possible
- HashRouter handles routing client-side
- Compatible with direct URL access

### 3. Public Assets Configuration

**404.html File:** `public/404.html`

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Ticket Management App</title>
    <script type="text/javascript">
      // Redirect to index.html for HashRouter
      window.location.href = '/tiketareact/';
    </script>
  </head>
  <body>
    <p>Redirecting...</p>
  </body>
</html>
```

**Asset Path Configuration:**
- All assets must include base path
- Handled automatically by Vite build process
- No manual path configuration needed

## Build Configuration

### 1. Package.json Scripts

**Required Scripts:**
```json
{
  "scripts": {
    "build": "tsc && vite build",
    "verify-build": "node scripts/verify-build.cjs",
    "health-check": "node scripts/health-check.cjs",
    "build:verify": "npm run build && npm run verify-build"
  }
}
```

### 2. TypeScript Configuration

**File:** `tsconfig.json`

**Key Settings:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true
  }
}
```

### 3. Build Optimization

**Vite Build Options:**
```typescript
build: {
  // Enable source maps for debugging
  sourcemap: true,
  
  // CSS optimization
  cssCodeSplit: true,
  
  // JavaScript minification
  minify: 'terser',
  terserOptions: {
    compress: {
      drop_console: true,
      drop_debugger: true,
    },
  },
  
  // Code splitting configuration
  rollupOptions: {
    output: {
      manualChunks: {
        'react-vendor': ['react', 'react-dom'],
        'router-vendor': ['react-router-dom'],
        // Additional chunks...
      }
    }
  }
}
```

## Security Configuration

### 1. Workflow Security

**Token Permissions:**
```yaml
permissions:
  contents: read    # Read repository contents
  pages: write      # Deploy to GitHub Pages
  id-token: write   # OIDC token for deployment
```

**Security Best Practices:**
- Use minimal required permissions
- No secrets required for basic deployment
- Environment protection rules (optional)

### 2. Content Security Policy

**Recommended CSP Headers:**
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data: https:;">
```

**Note:** GitHub Pages doesn't support custom headers, but CSP can be added via meta tags.

## Performance Configuration

### 1. Caching Strategy

**Asset Caching:**
- Hash-based file names for cache busting
- Long-term caching for static assets
- Automatic cache invalidation on updates

**Configuration:**
```typescript
build: {
  rollupOptions: {
    output: {
      entryFileNames: 'assets/[name]-[hash].js',
      chunkFileNames: 'chunks/[name]-[hash].js',
      assetFileNames: 'assets/[name]-[hash][extname]'
    }
  }
}
```

### 2. Compression

**Gzip Compression:**
- Enabled automatically by GitHub Pages
- No additional configuration required
- Reduces transfer sizes significantly

**Build-time Optimization:**
```typescript
build: {
  minify: 'terser',
  cssCodeSplit: true,
  chunkSizeWarningLimit: 1000,
  assetsInlineLimit: 4096
}
```

## Monitoring Configuration

### 1. Deployment Monitoring

**GitHub Actions Notifications:**
```yaml
- name: Notify deployment success
  if: success()
  uses: actions/github-script@v6
  with:
    script: |
      github.rest.repos.createCommitComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        commit_sha: '${{ github.sha }}',
        body: '🚀 Deployment successful!'
      });
```

### 2. Health Monitoring

**Automated Health Checks:**
```bash
# Run after deployment
npm run health-check https://username.github.io/tiketareact/
```

**Monitoring Script Configuration:**
- Check site accessibility
- Validate asset loading
- Test routing functionality
- Verify performance metrics

## Troubleshooting Configuration

### 1. Debug Mode

**Enable Debug Logging:**
```yaml
env:
  DEBUG: true
  VITE_DEBUG: true
```

### 2. Build Verification

**Verification Scripts:**
```bash
# Verify build output
npm run verify-build

# Check deployment health
npm run health-check

# Monitor deployment status
npm run monitor
```

## Migration from Other Platforms

### From Netlify/Vercel

**Key Differences:**
- No server-side rendering support
- No custom headers/redirects
- No environment variables in build
- Must use HashRouter instead of BrowserRouter

**Migration Steps:**
1. Update router to HashRouter
2. Configure base path in Vite config
3. Add 404.html for fallback
4. Update deployment workflow
5. Test thoroughly

### From Traditional Hosting

**Changes Required:**
- Static files only (no server-side code)
- Client-side routing only
- No .htaccess or server configuration
- All assets must be relative to base path

## Validation Checklist

### Pre-deployment Validation

- [ ] Repository has GitHub Pages enabled
- [ ] Workflow has correct permissions
- [ ] Base path matches repository name
- [ ] HashRouter is configured
- [ ] 404.html exists and redirects correctly
- [ ] Build completes without errors
- [ ] All tests pass
- [ ] Assets load correctly in preview

### Post-deployment Validation

- [ ] Site loads without blank screen
- [ ] All routes are accessible
- [ ] Assets load correctly
- [ ] Navigation works properly
- [ ] Mobile responsiveness works
- [ ] No console errors
- [ ] Performance is acceptable

## Common Configuration Mistakes

### 1. Incorrect Base Path

**Wrong:**
```typescript
base: '/tiketareact'  // Missing trailing slash
base: 'tiketareact/'  // Missing leading slash
base: '/TiketaReact/' // Wrong case
```

**Correct:**
```typescript
base: '/tiketareact/' // Exact repository name with slashes
```

### 2. Wrong Router Type

**Wrong:**
```typescript
import { BrowserRouter as Router } from 'react-router-dom'
```

**Correct:**
```typescript
import { HashRouter as Router } from 'react-router-dom'
```

### 3. Missing 404.html

**Problem:** Direct URLs return 404 errors

**Solution:** Add `public/404.html` with redirect script

### 4. Incorrect Workflow Permissions

**Wrong:**
```yaml
permissions:
  contents: write  # Too broad
```

**Correct:**
```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

## Support and Updates

### Configuration Updates

When updating configuration:
1. Test changes locally first
2. Update documentation
3. Deploy to staging (if available)
4. Monitor deployment carefully
5. Be ready to rollback if needed

### Getting Help

For configuration issues:
1. Check [Troubleshooting Guide](./TROUBLESHOOTING.md)
2. Review [Deployment Guide](./DEPLOYMENT.md)
3. Check GitHub Pages documentation
4. Create issue with full configuration details

---

**Last Updated:** October 2024  
**Version:** 1.0.0  
**Maintainer:** Development Team