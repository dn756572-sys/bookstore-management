const sql = require('mssql');
require('dotenv').config();

// Build connection config dynamically
const getDbConfig = () => {
  const baseConfig = {
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_DATABASE || 'BookStoreManagement',
    port: parseInt(process.env.DB_PORT) || 1433,
    options: {
      enableArithAbort: true,
      trustServerCertificate: true,
      encrypt: false
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000
    }
  };

  // Nếu dùng Windows Authentication
  if (process.env.DB_TRUSTED_CONNECTION === 'true') {
    return {
      ...baseConfig,
      options: {
        ...baseConfig.options,
        trustedConnection: true,
        trustServerCertificate: true
      }
    };
  }

  // SQL Server Authentication
  return {
    ...baseConfig,
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '123456',
  };
};

const dbConfig = getDbConfig();

console.log('🔧 Database Config:', {
  server: dbConfig.server,
  database: dbConfig.database,
  user: dbConfig.user || 'Windows Authentication',
  hasPassword: !!dbConfig.password
});

let poolPromise;

const connectDB = async () => {
  try {
    console.log('🔄 Attempting to connect to database...');
    
    // Tạo connection pool
    poolPromise = new sql.ConnectionPool(dbConfig);
    const pool = await poolPromise.connect();
    
    console.log(`✅ Connected successfully to ${dbConfig.server}!`);
    
    // Test query đơn giản
    try {
      const result = await pool.request().query('SELECT DB_NAME() as dbName, @@SERVERNAME as serverName');
      console.log('📊 Connected to:', result.recordset[0]);
    } catch (queryError) {
      console.log('⚠️ Test query failed but connection established:', queryError.message);
    }
    
    return pool;
    
  } catch (err) {
    console.error('💥 Database connection failed:', err.message);
    console.log('\n🔍 TROUBLESHOOTING GUIDE:');
    console.log('1. 📋 Check SQL Server is running:');
    console.log('   - Open Services.msc → Look for "SQL Server (MSSQLSERVER)" or "SQL Server (SQLEXPRESS)"');
    console.log('   - Make sure it\'s "Running"');
    
    console.log('2. 🔐 Check Authentication Mode:');
    console.log('   - Open SQL Server Management Studio (SSMS)');
    console.log('   - Right-click server → Properties → Security');
    console.log('   - Select "SQL Server and Windows Authentication mode"');
    
    console.log('3. 🌐 Enable TCP/IP:');
    console.log('   - Open "SQL Server Configuration Manager"');
    console.log('   - SQL Server Network Configuration → Protocols for [Instance]');
    console.log('   - Enable TCP/IP → Restart SQL Server');
    
    console.log('4. 👤 Check credentials in .env file:');
    console.log('   - DB_SERVER=localhost');
    console.log('   - DB_DATABASE=BookStoreManagement'); 
    console.log('   - DB_USER=sa');
    console.log('   - DB_PASSWORD=your_password');
    console.log('   - DB_TRUSTED_CONNECTION=false');
    
    console.log('5. 🚀 Test connection manually:');
    console.log('   - Open SSMS → Try connecting with your credentials');
    
    // Không exit process để server vẫn chạy
    throw err;
  }
};

sql.on('error', err => {
  console.error('💥 SQL Server Error:', err);
});

// Export poolPromise để sử dụng trong controllers
module.exports = {
  sql,
  connectDB,
  poolPromise: poolPromise ? poolPromise : (async () => {
    await connectDB();
    return poolPromise;
  })(),
  getPool: () => poolPromise
};