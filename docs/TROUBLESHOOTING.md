# GitHub Pages Deployment Troubleshooting Guide

This guide provides solutions to common issues encountered when deploying the Ticket Management Application to GitHub Pages.

## Quick Diagnosis

### 1. Check Deployment Status

```bash
# Verify build locally
npm run build:verify

# Check site health
npm run health-check https://yourusername.github.io/tiketareact/

# Monitor deployment
npm run monitor
```

### 2. Common Symptoms and Quick Fixes

| Symptom | Quick Fix | Details |
|---------|-----------|---------|
| Blank screen | Check base path in `vite.config.ts` | [Blank Screen Issues](#blank-screen-issues) |
| 404 on routes | Verify HashRouter usage | [Routing Issues](#routing-issues) |
| Assets not loading | Check asset paths and base URL | [Asset Loading Issues](#asset-loading-issues) |
| Build failures | Fix TypeScript/linting errors | [Build Issues](#build-issues) |
| Slow loading | Analyze bundle size | [Performance Issues](#performance-issues) |

## Detailed Troubleshooting

### Blank Screen Issues

#### Symptoms
- Page loads but displays blank screen
- No visible content
- Console may show errors

#### Diagnosis Steps

1. **Check Browser Console**
   ```javascript
   // Open DevTools (F12) and look for:
   // - Asset loading errors (404s)
   // - JavaScript errors
   // - Network failures
   ```

2. **Verify Base Path Configuration**
   ```typescript
   // vite.config.ts - Must match repository name
   export default defineConfig({
     base: '/tiketareact/', // ← This must be correct
   })
   ```

3. **Check Build Output**
   ```bash
   npm run build
   cat dist/index.html
   # Verify asset paths include base path
   ```

#### Solutions

1. **Fix Base Path**
   ```typescript
   // vite.config.ts
   base: '/your-actual-repo-name/',
   ```

2. **Rebuild and Redeploy**
   ```bash
   npm run build
   git add .
   git commit -m "Fix base path configuration"
   git push origin main
   ```

3. **Verify Asset Paths**
   ```html
   <!-- dist/index.html should show: -->
   <script src="/tiketareact/assets/index-abc123.js"></script>
   <link href="/tiketareact/assets/styles/index-def456.css" rel="stylesheet">
   ```

### Routing Issues

#### Symptoms
- Direct URLs return 404 errors
- Page refresh shows 404
- Navigation doesn't work

#### Diagnosis Steps

1. **Check Router Type**
   ```typescript
   // App.tsx - Should use HashRouter
   import { HashRouter as Router } from 'react-router-dom'
   ```

2. **Test URL Patterns**
   ```
   ✅ https://username.github.io/tiketareact/#/
   ✅ https://username.github.io/tiketareact/#/login
   ❌ https://username.github.io/tiketareact/login (without hash)
   ```

3. **Check 404.html**
   ```bash
   ls -la public/404.html
   cat public/404.html
   ```

#### Solutions

1. **Use HashRouter**
   ```typescript
   // App.tsx
   import { HashRouter as Router } from 'react-router-dom'
   
   function App() {
     return (
       <Router>
         {/* Your routes */}
       </Router>
     )
   }
   ```

2. **Ensure 404.html Exists**
   ```html
   <!-- public/404.html -->
   <!DOCTYPE html>
   <html>
     <head>
       <meta charset="utf-8">
       <title>Ticket Management App</title>
       <script type="text/javascript">
         window.location.href = '/tiketareact/';
       </script>
     </head>
     <body>
       <p>Redirecting...</p>
     </body>
   </html>
   ```

3. **Test Routing Locally**
   ```bash
   npm run build
   npm run preview
   # Test navigation in preview mode
   ```

### Asset Loading Issues

#### Symptoms
- CSS styles not applied
- JavaScript not executing
- Images not displaying
- Console shows 404 errors for assets

#### Diagnosis Steps

1. **Check Network Tab**
   - Open DevTools → Network tab
   - Reload page
   - Look for failed requests (red entries)

2. **Verify Asset Paths**
   ```bash
   npm run build
   ls -la dist/assets/
   # Check if files exist with expected names
   ```

3. **Check Build Configuration**
   ```bash
   npm run verify-build
   # This will validate asset structure
   ```

#### Solutions

1. **Fix Asset Path Configuration**
   ```typescript
   // vite.config.ts
   build: {
     assetsDir: 'assets',
     rollupOptions: {
       output: {
         assetFileNames: (assetInfo) => {
           if (assetInfo.name?.endsWith('.css')) {
             return 'assets/styles/[name]-[hash][extname]'
           }
           return 'assets/[name]-[hash][extname]'
         }
       }
     }
   }
   ```

2. **Verify Public Assets**
   ```bash
   # Check public folder structure
   ls -la public/
   # Ensure assets are in correct locations
   ```

3. **Test Asset Loading**
   ```bash
   # Build and check asset references
   npm run build
   grep -r "assets/" dist/index.html
   ```

### Build Issues

#### Symptoms
- GitHub Actions workflow fails
- TypeScript compilation errors
- Linting failures
- Test failures

#### Diagnosis Steps

1. **Check Workflow Logs**
   - Go to GitHub repository
   - Click "Actions" tab
   - Click on failed workflow
   - Review error messages

2. **Test Locally**
   ```bash
   # Run the same checks as CI
   npm run lint
   npm run test
   npm run build
   ```

3. **Check Dependencies**
   ```bash
   npm audit
   npm outdated
   ```

#### Solutions

1. **Fix TypeScript Errors**
   ```bash
   # Check for type errors
   npx tsc --noEmit
   
   # Fix common issues:
   # - Missing type definitions
   # - Incorrect imports
   # - Type mismatches
   ```

2. **Fix Linting Issues**
   ```bash
   npm run lint
   npm run lint -- --fix  # Auto-fix some issues
   ```

3. **Update Dependencies**
   ```bash
   npm update
   npm audit fix
   npm test  # Verify everything still works
   ```

4. **Check Node Version**
   ```yaml
   # .github/workflows/deploy.yml
   - name: Setup Node.js
     uses: actions/setup-node@v4
     with:
       node-version: '18'  # Ensure this matches local version
   ```

### Performance Issues

#### Symptoms
- Slow page loading
- Large bundle sizes
- Poor mobile performance
- High memory usage

#### Diagnosis Steps

1. **Analyze Bundle Size**
   ```bash
   npm run build
   # Check output for large files
   du -sh dist/chunks/*
   ```

2. **Check Network Performance**
   - Open DevTools → Network tab
   - Reload with cache disabled
   - Check loading times and file sizes

3. **Run Performance Audit**
   - Open DevTools → Lighthouse tab
   - Run performance audit
   - Review recommendations

#### Solutions

1. **Optimize Bundle Size**
   ```typescript
   // vite.config.ts - Improve code splitting
   build: {
     rollupOptions: {
       output: {
         manualChunks: (id) => {
           if (id.includes('node_modules')) {
             if (id.includes('react')) return 'react-vendor'
             if (id.includes('router')) return 'router-vendor'
             return 'vendor'
           }
         }
       }
     }
   }
   ```

2. **Enable Compression**
   ```typescript
   // vite.config.ts
   build: {
     minify: 'terser',
     terserOptions: {
       compress: {
         drop_console: true,
         drop_debugger: true,
       },
     },
   }
   ```

3. **Optimize Images**
   ```bash
   # Use appropriate image formats
   # Compress images before adding to project
   # Consider lazy loading for images
   ```

### GitHub Actions Issues

#### Symptoms
- Workflow doesn't trigger
- Permission errors
- Deployment fails
- Pages not updating

#### Diagnosis Steps

1. **Check Workflow File**
   ```yaml
   # .github/workflows/deploy.yml
   on:
     push:
       branches: [ main ]  # Ensure this matches your branch
   ```

2. **Verify Permissions**
   ```yaml
   permissions:
     contents: read
     pages: write
     id-token: write
   ```

3. **Check Repository Settings**
   - Go to Settings → Pages
   - Ensure source is set to "GitHub Actions"
   - Check if Pages is enabled

#### Solutions

1. **Fix Workflow Triggers**
   ```yaml
   on:
     push:
       branches: [ main ]
     pull_request:
       branches: [ main ]
   ```

2. **Update Permissions**
   ```yaml
   jobs:
     deploy:
       permissions:
         contents: read
         pages: write
         id-token: write
   ```

3. **Enable GitHub Pages**
   - Repository Settings → Pages
   - Source: "GitHub Actions"
   - Save settings

### Environment-Specific Issues

#### Development vs Production

1. **Environment Variables**
   ```typescript
   // Check environment in code
   console.log('Environment:', import.meta.env.MODE)
   console.log('Base URL:', import.meta.env.BASE_URL)
   ```

2. **Different Behavior**
   ```bash
   # Test production build locally
   npm run build
   npm run preview
   ```

#### Browser Compatibility

1. **Check Browser Support**
   ```javascript
   // Check for modern features
   if (!window.fetch) {
     console.error('Browser not supported')
   }
   ```

2. **Test in Different Browsers**
   - Chrome/Chromium
   - Firefox
   - Safari
   - Edge

## Emergency Procedures

### Quick Rollback

If deployment breaks production:

1. **Revert Last Commit**
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Deploy Previous Version**
   ```bash
   git reset --hard HEAD~1
   git push --force origin main
   ```

3. **Manual Rollback**
   - Go to GitHub Actions
   - Re-run previous successful deployment

### Hotfix Process

For urgent fixes:

1. **Create Hotfix Branch**
   ```bash
   git checkout -b hotfix/urgent-fix
   # Make minimal changes
   git commit -m "Hotfix: description"
   ```

2. **Test Quickly**
   ```bash
   npm run build:verify
   npm run test
   ```

3. **Deploy Immediately**
   ```bash
   git checkout main
   git merge hotfix/urgent-fix
   git push origin main
   ```

## Prevention Strategies

### Pre-deployment Checklist

- [ ] Run `npm run build:verify`
- [ ] Test locally with `npm run preview`
- [ ] Check all routes work
- [ ] Verify assets load correctly
- [ ] Test on mobile device
- [ ] Check browser console for errors

### Monitoring Setup

1. **Automated Checks**
   ```bash
   # Add to CI/CD pipeline
   npm run health-check $DEPLOYMENT_URL
   ```

2. **Regular Maintenance**
   - Weekly dependency updates
   - Monthly security audits
   - Quarterly performance reviews

### Documentation Updates

Keep this troubleshooting guide updated:
- Document new issues as they arise
- Update solutions when configurations change
- Add new diagnostic tools and commands

## Getting Help

### Internal Resources

1. **Check Documentation**
   - [Deployment Guide](./DEPLOYMENT.md)
   - [Architecture Documentation](./ARCHITECTURE.md)

2. **Run Diagnostics**
   ```bash
   npm run build:verify
   npm run health-check
   npm run monitor
   ```

### External Resources

1. **GitHub Pages Documentation**
   - [GitHub Pages Docs](https://docs.github.com/en/pages)
   - [Troubleshooting Guide](https://docs.github.com/en/pages/getting-started-with-github-pages/troubleshooting-404-errors-for-github-pages-sites)

2. **Vite Documentation**
   - [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
   - [GitHub Pages Deployment](https://vitejs.dev/guide/static-deploy.html#github-pages)

3. **Community Support**
   - Stack Overflow
   - GitHub Discussions
   - React Router Documentation

### Creating Support Tickets

When creating issues, include:

1. **Environment Information**
   ```bash
   node --version
   npm --version
   git --version
   ```

2. **Error Details**
   - Full error messages
   - Browser console output
   - Network tab screenshots
   - Workflow logs

3. **Reproduction Steps**
   - Exact steps to reproduce
   - Expected vs actual behavior
   - Browser and OS information

---

**Last Updated:** October 2024  
**Version:** 1.0.0  
**Maintainer:** Development Team