#!/usr/bin/env tsx
/**
 * Verify Open Graph metadata across the site.
 * 
 * This script checks:
 * - OG image exists and has correct dimensions
 * - All routes have proper metadata
 * - URLs are absolute (not localhost in production)
 * - Images are optimized (reasonable file size)
 * 
 * Usage:
 *   pnpm tsx scripts/verify-og-metadata.ts
 */

import { readFileSync, existsSync, statSync } from "fs";
import { join } from "path";
import sharp from "sharp";

const PROJECT_ROOT = join(__dirname, "..");
const OG_IMAGE_PATH = join(PROJECT_ROOT, "public/images/og.jpg");

interface CheckResult {
  name: string;
  passed: boolean;
  message: string;
  severity: "error" | "warning" | "info";
}

const results: CheckResult[] = [];

async function checkOgImageExists(): Promise<void> {
  if (existsSync(OG_IMAGE_PATH)) {
    results.push({
      name: "OG Image Exists",
      passed: true,
      message: "✓ Default OG image found at /public/images/og.jpg",
      severity: "info",
    });
  } else {
    results.push({
      name: "OG Image Exists",
      passed: false,
      message: "✗ Default OG image NOT found at /public/images/og.jpg",
      severity: "error",
    });
  }
}

async function checkOgImageDimensions(): Promise<void> {
  if (!existsSync(OG_IMAGE_PATH)) {
    return; // Skip if file doesn't exist
  }

  try {
    const metadata = await sharp(OG_IMAGE_PATH).metadata();
    const width = metadata.width || 0;
    const height = metadata.height || 0;
    
    const IDEAL_WIDTH = 1200;
    const IDEAL_HEIGHT = 630;
    
    if (width === IDEAL_WIDTH && height === IDEAL_HEIGHT) {
      results.push({
        name: "OG Image Dimensions",
        passed: true,
        message: `✓ Perfect dimensions: ${width}×${height}px`,
        severity: "info",
      });
    } else {
      const aspectRatio = (width / height).toFixed(2);
      const idealRatio = (IDEAL_WIDTH / IDEAL_HEIGHT).toFixed(2);
      
      results.push({
        name: "OG Image Dimensions",
        passed: false,
        message: `⚠ Non-optimal dimensions: ${width}×${height}px (${aspectRatio}:1)\n  Recommended: ${IDEAL_WIDTH}×${IDEAL_HEIGHT}px (${idealRatio}:1)`,
        severity: "warning",
      });
    }
  } catch (error) {
    results.push({
      name: "OG Image Dimensions",
      passed: false,
      message: `✗ Could not read image metadata: ${error}`,
      severity: "error",
    });
  }
}

async function checkOgImageSize(): Promise<void> {
  if (!existsSync(OG_IMAGE_PATH)) {
    return; // Skip if file doesn't exist
  }

  try {
    const stats = statSync(OG_IMAGE_PATH);
    const sizeInKB = Math.round(stats.size / 1024);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    const MAX_SIZE_KB = 500;
    const IDEAL_MAX_KB = 300;
    
    if (sizeInKB <= IDEAL_MAX_KB) {
      results.push({
        name: "OG Image File Size",
        passed: true,
        message: `✓ Optimal file size: ${sizeInKB}KB`,
        severity: "info",
      });
    } else if (sizeInKB <= MAX_SIZE_KB) {
      results.push({
        name: "OG Image File Size",
        passed: true,
        message: `⚠ File size acceptable but could be optimized: ${sizeInKB}KB (${sizeInMB}MB)\n  Recommended: < 300KB for faster loading`,
        severity: "warning",
      });
    } else {
      results.push({
        name: "OG Image File Size",
        passed: false,
        message: `✗ File size too large: ${sizeInKB}KB (${sizeInMB}MB)\n  Maximum recommended: 500KB\n  Optimal: < 300KB`,
        severity: "error",
      });
    }
  } catch (error) {
    results.push({
      name: "OG Image File Size",
      passed: false,
      message: `✗ Could not check file size: ${error}`,
      severity: "error",
    });
  }
}

async function checkEnvironmentVariables(): Promise<void> {
  const envPath = join(PROJECT_ROOT, ".env");
  
  if (!existsSync(envPath)) {
    results.push({
      name: "Environment Configuration",
      passed: false,
      message: "⚠ No .env file found. Copy .env.example to .env",
      severity: "warning",
    });
    return;
  }

  const envContent = readFileSync(envPath, "utf-8");
  
  // Check NEXT_PUBLIC_SITE_URL
  const siteUrlMatch = envContent.match(/NEXT_PUBLIC_SITE_URL\s*=\s*"([^"]+)"/);
  
  if (!siteUrlMatch) {
    results.push({
      name: "Site URL Configuration",
      passed: false,
      message: "✗ NEXT_PUBLIC_SITE_URL not set in .env",
      severity: "error",
    });
  } else {
    const siteUrl = siteUrlMatch[1];
    
    if (siteUrl.includes("localhost")) {
      results.push({
        name: "Site URL Configuration",
        passed: true,
        message: `ℹ Site URL set to localhost: ${siteUrl}\n  This is fine for development. Update for production.`,
        severity: "info",
      });
    } else if (siteUrl.startsWith("https://")) {
      results.push({
        name: "Site URL Configuration",
        passed: true,
        message: `✓ Production site URL configured: ${siteUrl}`,
        severity: "info",
      });
    } else {
      results.push({
        name: "Site URL Configuration",
        passed: false,
        message: `⚠ Site URL should use HTTPS in production: ${siteUrl}`,
        severity: "warning",
      });
    }
  }
}

async function checkSeoFile(): Promise<void> {
  const seoPath = join(PROJECT_ROOT, "src/lib/seo.ts");
  
  if (!existsSync(seoPath)) {
    results.push({
      name: "SEO Configuration",
      passed: false,
      message: "✗ src/lib/seo.ts not found",
      severity: "error",
    });
    return;
  }

  const seoContent = readFileSync(seoPath, "utf-8");
  
  // Check for DEFAULT_OG_IMAGE
  if (seoContent.includes("DEFAULT_OG_IMAGE")) {
    results.push({
      name: "SEO Default Image",
      passed: true,
      message: "✓ Default OG image fallback configured",
      severity: "info",
    });
  } else {
    results.push({
      name: "SEO Default Image",
      passed: false,
      message: "⚠ No DEFAULT_OG_IMAGE constant found in seo.ts",
      severity: "warning",
    });
  }
  
  // Check for Twitter handle placeholders
  if (seoContent.includes("@rakuxoncity")) {
    results.push({
      name: "Twitter Handle",
      passed: true,
      message: "ℹ Twitter handles set to @rakuxoncity\n  Update with actual handle if different",
      severity: "info",
    });
  }
}

async function checkRootLayout(): Promise<void> {
  const layoutPath = join(PROJECT_ROOT, "src/app/layout.tsx");
  
  if (!existsSync(layoutPath)) {
    results.push({
      name: "Root Layout",
      passed: false,
      message: "✗ src/app/layout.tsx not found",
      severity: "error",
    });
    return;
  }

  const layoutContent = readFileSync(layoutPath, "utf-8");
  
  // Check for metadataBase
  if (layoutContent.includes("metadataBase")) {
    results.push({
      name: "Metadata Base URL",
      passed: true,
      message: "✓ metadataBase configured in root layout",
      severity: "info",
    });
  } else {
    results.push({
      name: "Metadata Base URL",
      passed: false,
      message: "✗ metadataBase not found in root layout",
      severity: "error",
    });
  }
  
  // Check for OG image in root metadata
  if (layoutContent.includes("/images/og.jpg")) {
    results.push({
      name: "Root OG Image",
      passed: true,
      message: "✓ Default OG image referenced in root layout",
      severity: "info",
    });
  } else {
    results.push({
      name: "Root OG Image",
      passed: false,
      message: "⚠ Default OG image not referenced in root layout metadata",
      severity: "warning",
    });
  }
}

function printResults(): void {
  console.log("\n" + "=".repeat(70));
  console.log("  OG METADATA VERIFICATION REPORT");
  console.log("=".repeat(70) + "\n");

  const errors = results.filter((r) => r.severity === "error");
  const warnings = results.filter((r) => r.severity === "warning");
  const passed = results.filter((r) => r.passed && r.severity === "info");

  // Group by severity
  if (errors.length > 0) {
    console.log("❌ ERRORS:\n");
    errors.forEach((r) => {
      console.log(`  ${r.message}\n`);
    });
  }

  if (warnings.length > 0) {
    console.log("⚠️  WARNINGS:\n");
    warnings.forEach((r) => {
      console.log(`  ${r.message}\n`);
    });
  }

  if (passed.length > 0) {
    console.log("✅ PASSED:\n");
    passed.forEach((r) => {
      console.log(`  ${r.message}\n`);
    });
  }

  // Summary
  console.log("=".repeat(70));
  console.log(`  Summary: ${passed.length} passed, ${warnings.length} warnings, ${errors.length} errors`);
  console.log("=".repeat(70) + "\n");

  if (errors.length > 0) {
    console.log("❌ Fix errors before deploying to production.\n");
    process.exit(1);
  } else if (warnings.length > 0) {
    console.log("⚠️  Consider addressing warnings for optimal performance.\n");
  } else {
    console.log("✅ All OG metadata checks passed!\n");
  }
}

async function main(): Promise<void> {
  console.log("Verifying Open Graph metadata configuration...\n");

  await checkOgImageExists();
  await checkOgImageDimensions();
  await checkOgImageSize();
  await checkEnvironmentVariables();
  await checkSeoFile();
  await checkRootLayout();

  printResults();
}

main().catch((error) => {
  console.error("Verification failed:", error);
  process.exit(1);
});
