import mysql from 'mysql2/promise';

const {
  DATABASE_URL,
  MYSQLHOST,
  MYSQLPORT,
  MYSQLUSER,
  MYSQLPASSWORD,
  MYSQLDATABASE,
} = process.env;

let poolConfig;

if (DATABASE_URL) {
  const u = new URL(DATABASE_URL);
  poolConfig = {
    host: u.hostname,
    port: Number(u.port || 3306),
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, ''),
    waitForConnections: true,
    connectionLimit: 10,
  };
} else {
  poolConfig = {
    host: MYSQLHOST || 'localhost',
    port: Number(MYSQLPORT || 3306),
    user: MYSQLUSER || 'root',
    password: MYSQLPASSWORD || '',
    database: MYSQLDATABASE || 'railway',
    waitForConnections: true,
    connectionLimit: 10,
  };
}

export const pool = await mysql.createPool(poolConfig);
