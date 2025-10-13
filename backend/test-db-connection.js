// test-db-connection.js
const { testConnection } = require('./config/database');

async function runTest() {
  console.log('🚀 Starting database connection test...\n');
  
  const success = await testConnection();
  
  console.log('\n' + '='.repeat(50));
  if (success) {
    console.log('🎉 Database test PASSED! Your connection is working.');
    process.exit(0);
  } else {
    console.log('💥 Database test FAILED! Check the errors above.');
    process.exit(1);
  }
}

// Run the test
runTest();