const mysql = require('mysql2/promise');

async function testHouseholdColumn() {
  let connection;
  
  try {
    // Database connection configuration
    const config = {
      host: 'localhost',
      user: 'root',
      password: '', // Add your MySQL password here if you have one
      database: 'uims' // Replace with your actual database name
    };
    
    connection = await mysql.createConnection(config);
    console.log('✅ Connected to database');
    
    // Check if households table exists
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'households'"
    );
    
    if (tables.length > 0) {
      console.log('✅ households table exists');
    } else {
      console.log('❌ households table does NOT exist');
    }
    
    // Check if household_id column exists in residents table
    const [columns] = await connection.execute(
      "SHOW COLUMNS FROM residents LIKE 'household_id'"
    );
    
    if (columns.length > 0) {
      console.log('✅ household_id column exists in residents table');
      console.log('Column details:', columns[0]);
    } else {
      console.log('❌ household_id column does NOT exist in residents table');
    }
    
    // Show all columns in residents table
    const [allColumns] = await connection.execute(
      "SHOW COLUMNS FROM residents"
    );
    
    console.log('\n📋 All columns in residents table:');
    allColumns.forEach(col => {
      console.log(`- ${col.Field} (${col.Type})`);
    });
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

testHouseholdColumn();
