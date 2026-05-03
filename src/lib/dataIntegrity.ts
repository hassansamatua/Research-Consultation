import { getMany, insert } from './db';

/**
 * Data integrity checks to ensure database consistency
 * These functions can be called during application startup or periodically
 */

/**
 * Checks and fixes supervisor record integrity
 * Ensures all users with supervisor role have corresponding supervisor records
 */
export async function checkSupervisorIntegrity(autoFix: boolean = false) {
  try {
    console.log('🔍 Checking supervisor data integrity...');

    // Find users with supervisor role but no supervisor records
    const usersWithoutSupervisorRecord = await getMany(`
      SELECT u.id, u.first_name, u.last_name, u.email
      FROM users u
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN supervisors s ON u.id = s.user_id
      WHERE r.name = 'supervisor' AND s.id IS NULL
    `);

    if (usersWithoutSupervisorRecord.length === 0) {
      console.log('✅ Supervisor data integrity check passed - all supervisor users have records');
      return { 
        status: 'healthy', 
        issues: 0,
        fixed: 0
      };
    }

    console.log(`⚠️ Found ${usersWithoutSupervisorRecord.length} supervisor users without records`);

    if (!autoFix) {
      return { 
        status: 'issues_found', 
        issues: usersWithoutSupervisorRecord.length,
        users: usersWithoutSupervisorRecord
      };
    }

    // Auto-fix: Create missing supervisor records
    let fixedCount = 0;
    for (const user of usersWithoutSupervisorRecord) {
      try {
        const staffId = `STAFF${String(user.id).padStart(4, '0')}`;
        
        await insert('supervisors', {
          user_id: user.id,
          staff_id: staffId,
          department: 'General',
          specialization: 'General',
          academic_rank: 'Lecturer',
          max_students: 10,
          current_students: 0
        });

        console.log(`🔧 Auto-fixed: Created supervisor record for ${user.first_name} ${user.last_name}`);
        fixedCount++;
      } catch (error) {
        console.error(`❌ Failed to create supervisor record for user ${user.id}:`, error);
      }
    }

    console.log(`✅ Auto-fixed ${fixedCount} supervisor records`);
    return { 
      status: fixedCount > 0 ? 'fixed' : 'partial_fix', 
      issues: usersWithoutSupervisorRecord.length,
      fixed: fixedCount
    };

  } catch (error) {
    console.error('❌ Error during supervisor integrity check:', error);
    return { 
      status: 'error', 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Checks student record integrity
 * Ensures all users with student role have corresponding student records
 */
export async function checkStudentIntegrity(autoFix: boolean = false) {
  try {
    console.log('🔍 Checking student data integrity...');

    const usersWithoutStudentRecord = await getMany(`
      SELECT u.id, u.first_name, u.last_name, u.email
      FROM users u
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN students s ON u.id = s.user_id
      WHERE r.name = 'student' AND s.id IS NULL
    `);

    if (usersWithoutStudentRecord.length === 0) {
      console.log('✅ Student data integrity check passed - all student users have records');
      return { 
        status: 'healthy', 
        issues: 0,
        fixed: 0
      };
    }

    console.log(`⚠️ Found ${usersWithoutStudentRecord.length} student users without records`);

    if (!autoFix) {
      return { 
        status: 'issues_found', 
        issues: usersWithoutStudentRecord.length,
        users: usersWithoutStudentRecord
      };
    }

    // Auto-fix: Create missing student records
    let fixedCount = 0;
    for (const user of usersWithoutStudentRecord) {
      try {
        const registrationNumber = `REG${String(user.id).padStart(6, '0')}`;
        
        await insert('students', {
          user_id: user.id,
          registration_number: registrationNumber,
          program: 'General',
          degree_level: 'Masters',
          enrollment_date: new Date(),
          expected_completion_date: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000)
        });

        console.log(`🔧 Auto-fixed: Created student record for ${user.first_name} ${user.last_name}`);
        fixedCount++;
      } catch (error) {
        console.error(`❌ Failed to create student record for user ${user.id}:`, error);
      }
    }

    console.log(`✅ Auto-fixed ${fixedCount} student records`);
    return { 
      status: fixedCount > 0 ? 'fixed' : 'partial_fix', 
      issues: usersWithoutStudentRecord.length,
      fixed: fixedCount
    };

  } catch (error) {
    console.error('❌ Error during student integrity check:', error);
    return { 
      status: 'error', 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Runs all data integrity checks
 */
export async function runAllIntegrityChecks(autoFix: boolean = false) {
  console.log('🔄 Running all data integrity checks...');

  const supervisorCheck = await checkSupervisorIntegrity(autoFix);
  const studentCheck = await checkStudentIntegrity(autoFix);

  const totalIssues = (supervisorCheck.issues || 0) + (studentCheck.issues || 0);
  const totalFixed = (supervisorCheck.fixed || 0) + (studentCheck.fixed || 0);

  console.log('📊 Integrity check summary:');
  console.log(`  - Supervisor issues: ${supervisorCheck.issues || 0} (fixed: ${supervisorCheck.fixed || 0})`);
  console.log(`  - Student issues: ${studentCheck.issues || 0} (fixed: ${studentCheck.fixed || 0})`);
  console.log(`  - Total: ${totalIssues} issues, ${totalFixed} fixed`);

  return {
    overall: totalIssues === 0 ? 'healthy' : (totalFixed === totalIssues ? 'fixed' : 'partial'),
    supervisor: supervisorCheck,
    student: studentCheck,
    totalIssues,
    totalFixed
  };
}
