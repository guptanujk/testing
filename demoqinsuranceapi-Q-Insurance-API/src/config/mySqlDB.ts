import { logger } from "../helper/log4js/logger";
const mysql = require('mysql');


const pool = mysql.createPool({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    port: process.env.MYSQLPORT,
    connectionLimit: 10,
    connectTimeout: 1000000000,
    acquireTimeout: 1000000000,
    database: process.env.MYSQLDATABASE,
    multipleStatements: true
});


pool.getConnection((err: any, connection: any) => {
  if (err) {
    logger.error('DB not connected', err.message);
    throw err;
  }
  logger.info('Mysql DB Connected!');
  connection.release();
});
export default pool