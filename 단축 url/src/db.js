import mysql from 'mysql2/promise';

let cfg;
if (process.env.DATABASE_URL) {
  const u = new URL(process.env.DATABASE_URL);
  cfg = {
    host: u.hostname,
    port: Number(u.port || 3306),
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, ''),
    waitForConnections: true,
    connectionLimit: 10,
  };
} else {
  cfg = {
    host: process.env.MYSQLHOST,
    port: Number(process.env.MYSQLPORT || 3306),
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    waitForConnections: true,
    connectionLimit: 10,
  };
}

export const pool = await mysql.createPool(cfg);
console.log('[DB] pool created ->', cfg.host + ':' + cfg.port + '/' + cfg.database);
