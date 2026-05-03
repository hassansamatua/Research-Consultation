// Database sync script for supervisor records
// Run this script to ensure all users with supervisor roles have corresponding supervisor records

const mysql = require('mysql2/promise');

async function syncSupervisorRecords() {
  let connection;
  
  try {
    // Database connection
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'research_consultant'
    });

    console.log('🔄 Starting supervisor records sync...');

    // Find all users with supervisor role but no supervisor records
    const [usersWithoutSupervisor] = await connection.execute(`
      SELECT u.id, u.first_name, u.last_name, u.email
      FROM users u
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN supervisors s ON u.id = s.user_id
      WHERE r.name = 'supervisor' AND s.id IS NULL
    `);

    console.log(`📊 Found ${usersWithoutSupervisor.length} users needing supervisor records`);

    if (usersWithoutSupervisor.length === 0) {
      console.log('✅ All supervisor users have corresponding supervisor records');
      return;
    }

    // Create supervisor records for each user
    for (const user of usersWithoutSupervisor) {
      console.log(`👨‍🏫 Creating supervisor record for: ${user.first_name} ${user.last_name} (ID: ${user.id})`);
      
      // Generate staff ID if needed
      const staffId = `STAFF${String(user.id).padStart(4, '0')}`;
      
      await connection.execute(`
        INSERT INTO supervisors (user_id, staff_id, department, specialization, academic_rank, max_students, current_students)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        user.id,
        staffId,
        'General', // Default department
        'General', // Default specialization
        'Lecturer', // Default academic rank
        10, // Default max students
        0  // Default current students
      ]);

      console.log(`✅ Created supervisor record for user ID: ${user.id} with staff ID: ${staffId}`);
    }

    console.log('✅ Supervisor sync completed successfully');
    console.log(`📈 Created ${usersWithoutSupervisor.length} new supervisor records`);

  } catch (error) {
    console.error('❌ Error during supervisor sync:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the sync if this script is executed directly
if (require.main === module) {
  syncSupervisorRecords()
    .then(() => {
      console.log('🎉 Supervisor sync completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Supervisor sync failed:', error);
      process.exit(1);
    });
}

module.exports = { syncSupervisorRecords };
