import mysql from 'mysql2/promise';

const { DATABASE_URL, DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

export const pool = await mysql.createPool(
  DATABASE_URL
    ? { uri: DATABASE_URL, waitForConnections: true, connectionLimit: 10 }
    : {
        host: DB_HOST || 'localhost',
        user: DB_USER || 'root',
        password: DB_PASSWORD || '',
        database: DB_NAME || 'shortener',
        waitForConnections: true,
        connectionLimit: 10
      }
);
