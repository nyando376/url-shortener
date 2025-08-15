import mysql from 'mysql2/promise';

const {
  DATABASE_URL,
  MYSQLHOST,
  MYSQLPORT,
  MYSQLUSER,
  MYSQLPASSWORD,
  MYSQLDATABASE,
} = process.env;

export const pool = await mysql.createPool(
  DATABASE_URL
    ? {
        uri: DATABASE_URL, // mysql2 v3는 uri 키를 지원하지 않으므로 아래 대안 사용
      }
    : {
        host: MYSQLHOST || 'localhost',
        port: Number(MYSQLPORT || 3306),
        user: MYSQLUSER || 'root',
        password: MYSQLPASSWORD || '',
        database: MYSQLDATABASE || 'railway',
        waitForConnections: true,
        connectionLimit: 10,
      }
);

// DATABASE_URL을 쓰는 경우를 안전 처리
if (DATABASE_URL) {
  const u = new URL(DATABASE_URL);
  const cfg = {
    host: u.hostname,
    port: Number(u.port || 3306),
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, ''),
    waitForConnections: true,
    connectionLimit: 10,
  };
  // 재생성
  await pool.end().catch(() => {});
  export const pool = await mysql.createPool(cfg);
}
