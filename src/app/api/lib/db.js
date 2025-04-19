import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'your_database_host',
  user: process.env.MYSQL_USER || 'your_database_user',
  password: process.env.MYSQL_PASSWORD || 'your_database_password',
  database: process.env.MYSQL_DATABASE || 'your_database_name',
  port: process.env.MYSQL_PORT || 3306,
});

export { pool }; 