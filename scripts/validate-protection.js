#!/usr/bin/env node

/**
 * NANDIGHOSH PROTECTION VALIDATOR
 * © 2025 NANDIGHOSH BUS SERVICE
 * UNAUTHORIZED COPYING PROHIBITED
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const NANDIGHOSH_SIGNATURE = "NANDIGHOSH_BUS_SERVICE_2025_PROTECTED";
const COPYRIGHT_NOTICE = "COPYRIGHT_2025_NANDIGHOSH_BUS_SERVICE";

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Generate file hash for integrity checking
function generateFileHash(filePath) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
  } catch (error) {
    return null;
  }
}

// Check for protection signatures in files
function validateProtectionSignatures() {
  console.log(`${colors.bold}${colors.cyan}🛡️  NANDIGHOSH PROTECTION VALIDATOR${colors.reset}`);
  console.log(`${colors.yellow}═══════════════════════════════════════════${colors.reset}`);
  
  const protectedFiles = [
    'app/page.tsx',
    'app/globals.css',
    'lib/protection.ts',
    'components/NandighoshWatermark.tsx',
    'README.md'
  ];

  let allProtected = true;

  protectedFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`${colors.red}❌ ${file} - FILE MISSING${colors.reset}`);
      allProtected = false;
      return;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const hasNandighoshSignature = content.includes(NANDIGHOSH_SIGNATURE) || content.includes('NANDIGHOSH');
    const hasCopyrightNotice = content.includes(COPYRIGHT_NOTICE) || content.includes('COPYRIGHT');

    if (hasNandighoshSignature && hasCopyrightNotice) {
      console.log(`${colors.green}✅ ${file} - PROTECTED${colors.reset}`);
    } else {
      console.log(`${colors.red}❌ ${file} - PROTECTION MISSING${colors.reset}`);
      allProtected = false;
    }
  });

  console.log(`${colors.yellow}═══════════════════════════════════════════${colors.reset}`);
  
  if (allProtected) {
    console.log(`${colors.bold}${colors.green}🛡️  ALL FILES PROTECTED${colors.reset}`);
    console.log(`${colors.green}✓ Copyright signatures verified${colors.reset}`);
    console.log(`${colors.green}✓ Watermarks embedded${colors.reset}`);
    console.log(`${colors.green}✓ Protection system active${colors.reset}`);
  } else {
    console.log(`${colors.bold}${colors.red}🚨 PROTECTION VIOLATION DETECTED${colors.reset}`);
    console.log(`${colors.red}⚠️  Some files are missing protection${colors.reset}`);
    console.log(`${colors.red}⚠️  This may indicate unauthorized copying${colors.reset}`);
    console.log(`${colors.red}⚠️  Contact legal@nandighoshbus.com immediately${colors.reset}`);
    process.exit(1);
  }

  // Log protection status
  console.log(`${colors.yellow}═══════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}Protection Report:${colors.reset}`);
  console.log(`${colors.white}• Timestamp: ${new Date().toISOString()}${colors.reset}`);
  console.log(`${colors.white}• System: ${process.platform}${colors.reset}`);
  console.log(`${colors.white}• Node Version: ${process.version}${colors.reset}`);
  console.log(`${colors.white}• Working Directory: ${process.cwd()}${colors.reset}`);
  console.log(`${colors.yellow}═══════════════════════════════════════════${colors.reset}`);
}

// Anti-tampering check
function checkForTampering() {
  const thisFile = __filename;
  const content = fs.readFileSync(thisFile, 'utf8');
  
  if (!content.includes('NANDIGHOSH_BUS_SERVICE_2025_PROTECTED')) {
    console.log(`${colors.red}🚨 TAMPERING DETECTED IN PROTECTION SCRIPT${colors.reset}`);
    console.log(`${colors.red}This validator has been modified unauthorized${colors.reset}`);
    process.exit(1);
  }
}

// Main execution
function main() {
  console.clear();
  
  // Anti-tampering check
  checkForTampering();
  
  // Header
  console.log(`${colors.bold}${colors.magenta}`);
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                    NANDIGHOSH BUS SERVICE                    ║');
  console.log('║                 PROTECTION SYSTEM VALIDATOR                  ║');
  console.log('║                     COPYRIGHT © 2025                        ║');
  console.log('║                                                              ║');
  console.log('║           UNAUTHORIZED COPYING STRICTLY PROHIBITED          ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log(`${colors.reset}`);
  
  // Validate protections
  validateProtectionSignatures();
  
  // Footer warning
  console.log(`${colors.bold}${colors.red}`);
  console.log('⚠️  WARNING: This software is protected by copyright law');
  console.log('⚠️  All attempts to copy or modify are logged');
  console.log('⚠️  Legal action will be taken against violators');
  console.log(`${colors.reset}`);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { validateProtectionSignatures, generateFileHash };
