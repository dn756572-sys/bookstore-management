// Utility functions for database operations
const { poolPromise, sql } = require('../config/database');

const executeQuery = async (query, params = {}) => {
  try {
    const pool = await poolPromise;
    let request = pool.request();

    // Add parameters to request
    Object.keys(params).forEach(key => {
      const param = params[key];
      if (typeof param === 'number') {
        request = request.input(key, sql.Int, param);
      } else if (typeof param === 'boolean') {
        request = request.input(key, sql.Bit, param);
      } else if (param instanceof Date) {
        request = request.input(key, sql.DateTime, param);
      } else {
        request = request.input(key, sql.NVarChar, param);
      }
    });

    const result = await request.query(query);
    return result.recordset;
  } catch (error) {
    throw error;
  }
};

const executeStoredProcedure = async (procedureName, params = {}) => {
  try {
    const pool = await poolPromise;
    let request = pool.request();

    // Add parameters to request
    Object.keys(params).forEach(key => {
      const param = params[key];
      if (typeof param === 'number') {
        request = request.input(key, sql.Int, param);
      } else if (typeof param === 'boolean') {
        request = request.input(key, sql.Bit, param);
      } else if (param instanceof Date) {
        request = request.input(key, sql.DateTime, param);
      } else {
        request = request.input(key, sql.NVarChar, param);
      }
    });

    const result = await request.execute(procedureName);
    return result.recordset;
  } catch (error) {
    throw error;
  }
};

const checkConnection = async () => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT 1 as connected');
    return result.recordset[0].connected === 1;
  } catch (error) {
    return false;
  }
};

const getDatabaseInfo = async () => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        DB_NAME() as databaseName,
        @@VERSION as sqlServerVersion,
        (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE') as tableCount
    `);
    return result.recordset[0];
  } catch (error) {
    throw error;
  }
};

module.exports = {
  executeQuery,
  executeStoredProcedure,
  checkConnection,
  getDatabaseInfo
};