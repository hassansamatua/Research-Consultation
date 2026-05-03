import { runAllIntegrityChecks } from './dataIntegrity';

/**
 * Startup integrity check
 * Runs automatically when the application starts to ensure data consistency
 * This prevents issues like missing supervisor records from affecting users
 */

let hasRunStartupCheck = false;

export async function runStartupIntegrityCheck() {
  // Only run once per application lifecycle
  if (hasRunStartupCheck) {
    return;
  }

  try {
    console.log('🚀 Running startup data integrity check...');
    
    // Run integrity checks with auto-fix enabled
    const result = await runAllIntegrityChecks(true);
    
    if (result.overall === 'healthy') {
      console.log('✅ Startup integrity check passed - no issues found');
    } else if (result.overall === 'fixed') {
      console.log(`🔧 Startup integrity check fixed ${result.totalFixed} issues automatically`);
    } else {
      console.log(`⚠️ Startup integrity check found ${result.totalIssues} issues, fixed ${result.totalFixed}`);
      console.log('💡 Consider running manual sync for remaining issues');
    }

    hasRunStartupCheck = true;
    return result;

  } catch (error) {
    console.error('❌ Startup integrity check failed:', error);
    // Don't throw error to prevent app from starting, but log it
    hasRunStartupCheck = true;
    return { overall: 'error', error };
  }
}

/**
 * Manual trigger for integrity checks (can be called by admin)
 */
export async function triggerManualIntegrityCheck(autoFix: boolean = false) {
  console.log('🔧 Manual integrity check triggered...');
  return await runAllIntegrityChecks(autoFix);
}
