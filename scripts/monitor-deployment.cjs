#!/usr/bin/env node

/**
 * Deployment Monitoring Script
 * Continuously monitors the deployed application and reports issues
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CONFIG_FILE = path.join(__dirname, '..', '.github', 'monitoring-config.json');
const LOG_FILE = path.join(__dirname, '..', 'deployment-monitor.log');

// Default configuration
const DEFAULT_CONFIG = {
  url: 'https://username.github.io/tiketareact/',
  checkInterval: 300000, // 5 minutes
  timeout: 10000, // 10 seconds
  retries: 3,
  alertThreshold: 3, // Alert after 3 consecutive failures
  checks: {
    availability: true,
    performance: true,
    assets: true,
    routing: true
  }
};

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: '📋',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    debug: '🔍'
  }[type];
  
  const logMessage = `${prefix} [${timestamp}] ${message}`;
  console.log(logMessage);
  
  // Also write to log file
  try {
    fs.appendFileSync(LOG_FILE, `${logMessage}\n`);
  } catch (error) {
    // Ignore file write errors
  }
}

function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
      return { ...DEFAULT_CONFIG, ...config };
    }
  } catch (error) {
    log(`Error loading config: ${error.message}`, 'warning');
  }
  
  return DEFAULT_CONFIG;
}

function saveConfig(config) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  } catch (error) {
    log(`Error saving config: ${error.message}`, 'warning');
  }
}

function makeRequest(url, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const client = url.startsWith('https:') ? https : http;
    
    const request = client.get(url, {
      timeout: timeout,
      headers: {
        'User-Agent': 'GitHub-Pages-Monitor/1.0'
      }
    }, (response) => {
      let data = '';
      
      response.on('data', chunk => {
        data += chunk;
      });
      
      response.on('end', () => {
        const responseTime = Date.now() - startTime;
        resolve({
          statusCode: response.statusCode,
          headers: response.headers,
          body: data,
          responseTime: responseTime
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

async function checkAvailability(url, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await makeRequest(url);
      
      if (response.statusCode === 200) {
        return {
          success: true,
          statusCode: response.statusCode,
          responseTime: response.responseTime,
          body: response.body
        };
      } else {
        log(`Attempt ${attempt}: Status ${response.statusCode}`, 'warning');
      }
    } catch (error) {
      log(`Attempt ${attempt}: ${error.message}`, 'warning');
    }
    
    if (attempt < retries) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between retries
    }
  }
  
  return { success: false };
}

async function checkPerformance(url) {
  try {
    const response = await makeRequest(url);
    
    const metrics = {
      responseTime: response.responseTime,
      contentSize: response.body ? response.body.length : 0,
      status: 'healthy'
    };
    
    // Performance thresholds
    if (response.responseTime > 5000) {
      metrics.status = 'slow';
      log(`Slow response time: ${response.responseTime}ms`, 'warning');
    } else if (response.responseTime > 10000) {
      metrics.status = 'critical';
      log(`Critical response time: ${response.responseTime}ms`, 'error');
    }
    
    return { success: true, metrics };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function checkAssets(url, html) {
  try {
    // Extract asset URLs from HTML
    const cssMatches = html.match(/href="([^"]*\.css[^"]*)"/g) || [];
    const jsMatches = html.match(/src="([^"]*\.js[^"]*)"/g) || [];
    
    const cssUrls = cssMatches.map(match => {
      const assetUrl = match.match(/href="([^"]*)"/)[1];
      return assetUrl.startsWith('http') ? assetUrl : new URL(assetUrl, url).href;
    });
    
    const jsUrls = jsMatches.map(match => {
      const assetUrl = match.match(/src="([^"]*)"/)[1];
      return assetUrl.startsWith('http') ? assetUrl : new URL(assetUrl, url).href;
    });
    
    let failedAssets = 0;
    const totalAssets = cssUrls.length + Math.min(jsUrls.length, 3); // Check max 3 JS files
    
    // Check CSS files
    for (const cssUrl of cssUrls) {
      try {
        const response = await makeRequest(cssUrl, 5000);
        if (response.statusCode !== 200) {
          failedAssets++;
          log(`CSS asset failed: ${cssUrl} (${response.statusCode})`, 'warning');
        }
      } catch (error) {
        failedAssets++;
        log(`CSS asset error: ${cssUrl} - ${error.message}`, 'warning');
      }
    }
    
    // Check JS files (sample)
    const jsUrlsToCheck = jsUrls.slice(0, 3);
    for (const jsUrl of jsUrlsToCheck) {
      try {
        const response = await makeRequest(jsUrl, 5000);
        if (response.statusCode !== 200) {
          failedAssets++;
          log(`JS asset failed: ${jsUrl} (${response.statusCode})`, 'warning');
        }
      } catch (error) {
        failedAssets++;
        log(`JS asset error: ${jsUrl} - ${error.message}`, 'warning');
      }
    }
    
    return {
      success: failedAssets === 0,
      totalAssets,
      failedAssets,
      successRate: totalAssets > 0 ? ((totalAssets - failedAssets) / totalAssets * 100).toFixed(1) : 100
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function checkRouting(url) {
  const routes = ['#/', '#/login', '#/dashboard'];
  let failedRoutes = 0;
  
  for (const route of routes) {
    try {
      const routeUrl = `${url}${route}`;
      const response = await makeRequest(routeUrl, 5000);
      
      if (response.statusCode !== 200) {
        failedRoutes++;
        log(`Route failed: ${route} (${response.statusCode})`, 'warning');
      }
    } catch (error) {
      failedRoutes++;
      log(`Route error: ${route} - ${error.message}`, 'warning');
    }
  }
  
  return {
    success: failedRoutes === 0,
    totalRoutes: routes.length,
    failedRoutes,
    successRate: ((routes.length - failedRoutes) / routes.length * 100).toFixed(1)
  };
}

async function runHealthCheck(config) {
  log('Starting health check...', 'info');
  
  const results = {
    timestamp: new Date().toISOString(),
    url: config.url,
    checks: {}
  };
  
  // Availability check
  if (config.checks.availability) {
    log('Checking availability...', 'debug');
    const availabilityResult = await checkAvailability(config.url, config.retries);
    results.checks.availability = availabilityResult;
    
    if (!availabilityResult.success) {
      log('Site is not available!', 'error');
      return results;
    }
    
    log(`Site is available (${availabilityResult.responseTime}ms)`, 'success');
  }
  
  // Performance check
  if (config.checks.performance && results.checks.availability?.success) {
    log('Checking performance...', 'debug');
    const performanceResult = await checkPerformance(config.url);
    results.checks.performance = performanceResult;
    
    if (performanceResult.success) {
      log(`Performance: ${performanceResult.metrics.responseTime}ms, ${performanceResult.metrics.status}`, 'info');
    }
  }
  
  // Asset check
  if (config.checks.assets && results.checks.availability?.success) {
    log('Checking assets...', 'debug');
    const assetResult = await checkAssets(config.url, results.checks.availability.body);
    results.checks.assets = assetResult;
    
    if (assetResult.success) {
      log(`Assets: ${assetResult.successRate}% success rate`, 'success');
    } else {
      log(`Assets: ${assetResult.failedAssets}/${assetResult.totalAssets} failed`, 'warning');
    }
  }
  
  // Routing check
  if (config.checks.routing && results.checks.availability?.success) {
    log('Checking routing...', 'debug');
    const routingResult = await checkRouting(config.url);
    results.checks.routing = routingResult;
    
    if (routingResult.success) {
      log(`Routing: ${routingResult.successRate}% success rate`, 'success');
    } else {
      log(`Routing: ${routingResult.failedRoutes}/${routingResult.totalRoutes} failed`, 'warning');
    }
  }
  
  return results;
}

function generateReport(results) {
  const report = {
    timestamp: results.timestamp,
    url: results.url,
    overall: 'healthy',
    issues: []
  };
  
  // Check availability
  if (!results.checks.availability?.success) {
    report.overall = 'critical';
    report.issues.push('Site is not accessible');
  }
  
  // Check performance
  if (results.checks.performance?.metrics?.status === 'critical') {
    report.overall = 'critical';
    report.issues.push('Critical performance issues');
  } else if (results.checks.performance?.metrics?.status === 'slow') {
    if (report.overall === 'healthy') report.overall = 'degraded';
    report.issues.push('Slow response times');
  }
  
  // Check assets
  if (results.checks.assets && !results.checks.assets.success) {
    if (report.overall === 'healthy') report.overall = 'degraded';
    report.issues.push(`Asset loading issues (${results.checks.assets.failedAssets} failed)`);
  }
  
  // Check routing
  if (results.checks.routing && !results.checks.routing.success) {
    if (report.overall === 'healthy') report.overall = 'degraded';
    report.issues.push(`Routing issues (${results.checks.routing.failedRoutes} failed)`);
  }
  
  return report;
}

async function main() {
  const config = loadConfig();
  const url = process.argv[2] || config.url;
  
  // Update config with provided URL
  if (process.argv[2]) {
    config.url = url;
    saveConfig(config);
  }
  
  log(`Monitoring deployment at: ${url}`, 'info');
  
  try {
    const results = await runHealthCheck(config);
    const report = generateReport(results);
    
    log('='.repeat(50), 'info');
    log(`Overall Status: ${report.overall.toUpperCase()}`, report.overall === 'healthy' ? 'success' : 'warning');
    
    if (report.issues.length > 0) {
      log('Issues found:', 'warning');
      report.issues.forEach(issue => log(`- ${issue}`, 'warning'));
    } else {
      log('No issues detected', 'success');
    }
    
    // Save results for trend analysis
    const resultsFile = path.join(__dirname, '..', 'monitoring-results.json');
    try {
      let historicalResults = [];
      if (fs.existsSync(resultsFile)) {
        historicalResults = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
      }
      
      historicalResults.push(results);
      
      // Keep only last 100 results
      if (historicalResults.length > 100) {
        historicalResults = historicalResults.slice(-100);
      }
      
      fs.writeFileSync(resultsFile, JSON.stringify(historicalResults, null, 2));
    } catch (error) {
      log(`Error saving results: ${error.message}`, 'warning');
    }
    
    process.exit(report.overall === 'critical' ? 1 : 0);
    
  } catch (error) {
    log(`Monitoring error: ${error.message}`, 'error');
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

module.exports = { main, runHealthCheck, generateReport };