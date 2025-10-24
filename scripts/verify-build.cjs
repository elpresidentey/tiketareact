#!/usr/bin/env node

/**
 * Build Verification Script
 * Verifies that the build artifacts are correctly generated for GitHub Pages deployment
 */

const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, '..', 'dist');
const REQUIRED_FILES = [
  'index.html',
  '.vite/manifest.json'
];

const REQUIRED_PATTERNS = [
  /assets\/.*\.css$/,
  /assets\/.*\.js$/
];

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

function checkFileExists(filePath) {
  const fullPath = path.join(DIST_DIR, filePath);
  return fs.existsSync(fullPath);
}

function getDirectoryContents(dir) {
  try {
    return fs.readdirSync(dir, { withFileTypes: true });
  } catch (error) {
    return [];
  }
}

function getAllFiles(dir, fileList = []) {
  const files = getDirectoryContents(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file.name);
    const relativePath = path.relative(DIST_DIR, filePath);
    
    if (file.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else {
      fileList.push(relativePath);
    }
  });
  
  return fileList;
}

function verifyIndexHtml() {
  const indexPath = path.join(DIST_DIR, 'index.html');
  
  if (!fs.existsSync(indexPath)) {
    log('index.html not found', 'error');
    return false;
  }
  
  const content = fs.readFileSync(indexPath, 'utf8');
  
  // Check for essential elements
  const checks = [
    { pattern: /<title>.*<\/title>/, name: 'title tag' },
    { pattern: /<div id="root">/, name: 'root div' },
    { pattern: /(assets\/.*\.css|assets\/styles\/.*\.css)/, name: 'CSS assets' },
    { pattern: /(assets\/.*\.js|chunks\/.*\.js)/, name: 'JavaScript assets' },
    { pattern: /<meta charset="UTF-8"/, name: 'charset meta' },
    { pattern: /<meta name="viewport"/, name: 'viewport meta' }
  ];
  
  let criticalIssues = 0;
  
  checks.forEach(check => {
    if (check.pattern.test(content)) {
      log(`index.html contains ${check.name}`, 'success');
    } else {
      log(`index.html missing ${check.name}`, 'warning');
      criticalIssues++;
    }
  });
  
  return criticalIssues === 0;
}

function verifyAssets() {
  const allFiles = getAllFiles(DIST_DIR);
  
  // Normalize paths to use forward slashes for cross-platform compatibility
  const normalizedFiles = allFiles.map(file => file.replace(/\\/g, '/'));
  const assetFiles = normalizedFiles.filter(file => file.startsWith('assets/') || file.startsWith('chunks/'));
  
  if (assetFiles.length === 0) {
    log('No asset files found', 'error');
    return false;
  }
  
  log(`Found ${assetFiles.length} asset files`, 'info');
  
  // Check for CSS files
  const cssFiles = normalizedFiles.filter(file => file.endsWith('.css'));
  if (cssFiles.length > 0) {
    log(`Found ${cssFiles.length} CSS files`, 'success');
  } else {
    log('No CSS files found', 'warning');
  }
  
  // Check for JS files
  const jsFiles = normalizedFiles.filter(file => file.endsWith('.js') && !file.endsWith('.js.map'));
  if (jsFiles.length > 0) {
    log(`Found ${jsFiles.length} JavaScript files`, 'success');
  } else {
    log('No JavaScript files found', 'error');
    return false;
  }
  
  // Check for proper hashing
  const hashedFiles = normalizedFiles.filter(file => /-[a-zA-Z0-9]{8,}\.(css|js)$/.test(file));
  if (hashedFiles.length > 0) {
    log(`Found ${hashedFiles.length} properly hashed files`, 'success');
  } else {
    log('No properly hashed files found (may affect caching)', 'warning');
  }
  
  return true;
}

function verifyManifest() {
  const manifestPath = path.join(DIST_DIR, '.vite', 'manifest.json');
  
  if (!fs.existsSync(manifestPath)) {
    log('Vite manifest not found', 'warning');
    return false;
  }
  
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const entryCount = Object.keys(manifest).length;
    log(`Vite manifest contains ${entryCount} entries`, 'success');
    return true;
  } catch (error) {
    log(`Error reading manifest: ${error.message}`, 'error');
    return false;
  }
}

function verifyBuildSize() {
  const allFiles = getAllFiles(DIST_DIR);
  let totalSize = 0;
  
  allFiles.forEach(file => {
    const filePath = path.join(DIST_DIR, file);
    const stats = fs.statSync(filePath);
    totalSize += stats.size;
  });
  
  const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);
  log(`Total build size: ${totalSizeMB} MB`, 'info');
  
  if (totalSize > 50 * 1024 * 1024) { // 50MB
    log('Build size is quite large (>50MB)', 'warning');
  } else {
    log('Build size is reasonable', 'success');
  }
  
  return true;
}

function main() {
  log('Starting build verification...', 'info');
  
  // Check if dist directory exists
  if (!fs.existsSync(DIST_DIR)) {
    log('dist directory not found. Run "npm run build" first.', 'error');
    process.exit(1);
  }
  
  log(`Verifying build in: ${DIST_DIR}`, 'info');
  
  let allChecksPass = true;
  
  // Run all verification checks
  const checks = [
    { name: 'Required files', fn: () => REQUIRED_FILES.every(checkFileExists) },
    { name: 'index.html content', fn: verifyIndexHtml },
    { name: 'Asset files', fn: verifyAssets },
    { name: 'Vite manifest', fn: verifyManifest },
    { name: 'Build size', fn: verifyBuildSize }
  ];
  
  checks.forEach(check => {
    log(`Checking ${check.name}...`, 'info');
    const result = check.fn();
    
    if (result) {
      log(`${check.name} verification passed`, 'success');
    } else {
      log(`${check.name} verification failed`, 'error');
      allChecksPass = false;
    }
  });
  
  // Summary
  log('='.repeat(50), 'info');
  if (allChecksPass) {
    log('🎉 All build verifications passed! Ready for deployment.', 'success');
    process.exit(0);
  } else {
    log('❌ Some build verifications failed. Please check the issues above.', 'error');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main, verifyIndexHtml, verifyAssets, verifyManifest };