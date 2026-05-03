import { getMany, insert } from './db';

/**
 * Ensures all users with supervisor role have corresponding supervisor records
 * This function can be called when users are created or roles are updated
 */
export async function syncSupervisorRecords() {
  try {
    console.log('🔄 Syncing supervisor records...');
    
    // Find all users with supervisor role who don't have supervisor records
    const usersWithoutSupervisorRecord = await getMany(`
      SELECT u.id, u.first_name, u.last_name, u.email
      FROM users u
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN supervisors s ON u.id = s.user_id
      WHERE r.name = 'supervisor' AND s.id IS NULL
    `);

    console.log(`📊 Found ${usersWithoutSupervisorRecord.length} users needing supervisor records`);

    // Create supervisor records for each user
    for (const user of usersWithoutSupervisorRecord) {
      console.log(`👨‍🏫 Creating supervisor record for: ${user.first_name} ${user.last_name}`);
      
      const supervisorData = {
        user_id: user.id,
        department: 'General', // Default department
        specialization: 'General', // Default specialization
        academic_rank: 'Lecturer', // Default rank
        max_students: 10, // Default max students
        current_students: 0
      };

      await insert('supervisors', supervisorData);
      console.log(`✅ Created supervisor record for user ID: ${user.id}`);
    }

    console.log('✅ Supervisor sync completed successfully');
    return {
      success: true,
      syncedCount: usersWithoutSupervisorRecord.length
    };

  } catch (error) {
    console.error('❌ Error syncing supervisor records:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Creates a supervisor record for a specific user
 * Called when a user is assigned supervisor role
 */
export async function createSupervisorRecord(userId: number, department?: string, specialization?: string) {
  try {
    console.log(`👨‍🏫 Creating supervisor record for user ID: ${userId}`);
    
    // Check if supervisor record already exists
    const existingRecord = await getMany(`
      SELECT id FROM supervisors WHERE user_id = ?
    `, [userId]);

    if (existingRecord.length > 0) {
      console.log(`ℹ️ Supervisor record already exists for user ID: ${userId}`);
      return { success: true, exists: true };
    }

    const supervisorData = {
      user_id: userId,
      department: department || 'General',
      specialization: specialization || 'General',
      academic_rank: 'Lecturer',
      max_students: 10,
      current_students: 0
    };

    const supervisorId = await insert('supervisors', supervisorData);
    console.log(`✅ Created supervisor record with ID: ${supervisorId}`);
    
    return { 
      success: true, 
      supervisorId,
      created: true 
    };

  } catch (error) {
    console.error('❌ Error creating supervisor record:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
