import db from '../config/mySqlDB';
const getTenantUserDetails = (dbName: string, email: string) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM users WHERE email=? AND isActive=1;`;
    db.query(query, [email], (err: any, result: any) => {
      if (err) {
        return reject(err);
      }
      const data = JSON.parse(JSON.stringify(result));
      return resolve(data[0]);
    });
  });
};
const getUserById = (dbName: string, id: number) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM users WHERE id=? AND isActive=1;`;
    db.query(query, [id], (err: any, result: any) => {
      if (err) {
        return reject(err);
      }
      const data = JSON.parse(JSON.stringify(result));
      return resolve(data[0]);
    });
  });
};
export default {
  getTenantUserDetails, 
  getUserById
};