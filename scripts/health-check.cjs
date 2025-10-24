#!/usr/bin/env node

/**
 * Deployment Health Check Script
 * Verifies that the deployed application is working correctly on GitHub Pages
 */

const https = require('https');
const http = require('http');

const DEFAULT_URL = 'https://username.github.io/tiketareact/';
const TIMEOUT = 10000; // 10 seconds

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: '📋',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  }[type];
  
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;
    
    const request = client.get(url, {
      timeout: TIMEOUT,
      headers: {
        'User-Agent': 'GitHub-Pages-Health-Check/1.0'
      }
    }, (response) => {
      let data = '';
      
      response.on('data', chunk => {
        data += chunk;
      });
      
      response.on('end', () => {
        resolve({
          statusCode: response.statusCode,
          headers: response.headers,
          body: data
        });
      });
    });
    
    request.on('error', reject);
    request.on('timeout', () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function checkUrl(url, description = '') {
  log(`Checking ${description || url}...`, 'info');
  
  try {
    const response = await makeRequest(url);
    
    if (response.statusCode === 200) {
      log(`${description || url} is accessible (200 OK)`, 'success');
      return { success: true, statusCode: response.statusCode, body: response.body };
    } else {
      log(`${description || url} returned status ${response.statusCode}`, 'warning');
      return { success: false, statusCode: response.statusCode, body: response.body };
    }
  } catch (error) {
    log(`${description || url} failed: ${error.message}`, 'error');
    return { success: false, error: error.message };
  }
}

function validateHtmlContent(html) {
  const checks = [
    { pattern: /<title>.*<\/title>/, name: 'title tag', required: true },
    { pattern: /<div id="root">/, name: 'React root element', required: true },
    { pattern: /assets\/.*\.css/, name: 'CSS assets', required: true },
    { pattern: /assets\/.*\.js/, name: 'JavaScript assets', required: true },
    { pattern: /<meta charset="utf-8">/, name: 'charset meta', required: false },
    { pattern: /<meta name="viewport"/, name: 'viewport meta', required: false },
    { pattern: /tiketareact/i, name: 'app-specific content', required: false }
  ];
  
  let criticalIssues = 0;
  let warnings = 0;
  
  checks.forEach(check => {
    if (check.pattern.test(html)) {
      log(`HTML contains ${check.name}`, 'success');
    } else {
      if (check.required) {
        log(`HTML missing required ${check.name}`, 'error');
        criticalIssues++;
      } else {
        log(`HTML missing optional ${check.name}`, 'warning');
        warnings++;
      }
    }
  });
  
  return { criticalIssues, warnings };
}

async function checkAssetLoading(baseUrl, html) {
  log('Checking asset loading...', 'info');
  
  // Extract asset URLs from HTML
  const cssMatches = html.match(/href="([^"]*\.css[^"]*)"/g) || [];
  const jsMatches = html.match(/src="([^"]*\.js[^"]*)"/g) || [];
  
  const cssUrls = cssMatches.map(match => {
    const url = match.match(/href="([^"]*)"/)[1];
    return url.startsWith('http') ? url : new URL(url, baseUrl).href;
  });
  
  const jsUrls = jsMatches.map(match => {
    const url = match.match(/src="([^"]*)"/)[1];
    return url.startsWith('http') ? url : new URL(url, baseUrl).href;
  });
  
  log(`Found ${cssUrls.length} CSS files and ${jsUrls.length} JS files`, 'info');
  
  let assetFailures = 0;
  
  // Check CSS files
  for (const cssUrl of cssUrls) {
    const result = await checkUrl(cssUrl, `CSS: ${cssUrl.split('/').pop()}`);
    if (!result.success) assetFailures++;
  }
  
  // Check JS files (sample a few to avoid too many requests)
  const jsUrlsToCheck = jsUrls.slice(0, 3); // Check first 3 JS files
  for (const jsUrl of jsUrlsToCheck) {
    const result = await checkUrl(jsUrl, `JS: ${jsUrl.split('/').pop()}`);
    if (!result.success) assetFailures++;
  }
  
  return assetFailures;
}

async function checkRouting(baseUrl) {
  log('Checking routing...', 'info');
  
  // Test hash-based routes
  const routes = [
    '#/',
    '#/login',
    '#/dashboard'
  ];
  
  let routeFailures = 0;
  
  for (const route of routes) {
    const url = `${baseUrl}${route}`;
    const result = await checkUrl(url, `Route: ${route}`);
    if (!result.success) routeFailures++;
  }
  
  return routeFailures;
}

async function main() {
  const url = process.argv[2] || DEFAULT_URL;
  
  log('Starting deployment health check...', 'info');
  log(`Target URL: ${url}`, 'info');
  
  // Main page check
  const mainPageResult = await checkUrl(url, 'Main page');
  
  if (!mainPageResult.success) {
    log('Main page is not accessible. Deployment may have failed.', 'error');
    process.exit(1);
  }
  
  // Validate HTML content
  const htmlValidation = validateHtmlContent(mainPageResult.body);
  
  if (htmlValidation.criticalIssues > 0) {
    log(`Found ${htmlValidation.criticalIssues} critical HTML issues`, 'error');
  }
  
  if (htmlValidation.warnings > 0) {
    log(`Found ${htmlValidation.warnings} HTML warnings`, 'warning');
  }
  
  // Check asset loading
  const assetFailures = await checkAssetLoading(url, mainPageResult.body);
  
  // Check routing (if main page is working)
  const routeFailures = await checkRouting(url);
  
  // Summary
  log('='.repeat(50), 'info');
  
  const totalIssues = htmlValidation.criticalIssues + assetFailures + routeFailures;
  
  if (totalIssues === 0) {
    log('🎉 All health checks passed! Deployment is healthy.', 'success');
    process.exit(0);
  } else {
    log(`❌ Found ${totalIssues} issues during health check.`, 'error');
    log('Issues breakdown:', 'info');
    log(`- Critical HTML issues: ${htmlValidation.criticalIssues}`, 'info');
    log(`- Asset loading failures: ${assetFailures}`, 'info');
    log(`- Routing failures: ${routeFailures}`, 'info');
    log(`- HTML warnings: ${htmlValidation.warnings}`, 'info');
    
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    log(`Unexpected error: ${error.message}`, 'error');
    process.exit(1);
  });
}

module.exports = { main, checkUrl, validateHtmlContent };