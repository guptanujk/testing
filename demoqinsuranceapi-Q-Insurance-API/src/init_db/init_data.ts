import fs from 'fs';
import db from '../config/mySqlDB';

const createDefaultDbSchema = (dbName: string) => {
    return new Promise((resolve, reject) => {
      try {
          let schema = fs.readFileSync('./src/init_db/init_db_schema.sql', {
          encoding: 'utf-8',
          });
          schema = schema
            .replace(/{{dbName}}/g, dbName);
          
          db.query(schema, function (err: any, result: any) {
              if (err) {
                  console.log(`Error in creating default DB schema`, err.message);
                  return resolve(err);
              }
              console.log(`Default schema created successfully`);
              return resolve(true);
          });
        } catch (error: any) {
            console.log(error);
            return resolve(true)
        } 
    });
};


const init = async () => {
    try {
        setTimeout(() => {
            createDefaultDbSchema(process.env.MYSQLDATABASE || 'accelq_q_insurance')
        }, 5000);
    } catch (err) {
        console.log('Error at init DB', err);
    }
}

init();
export default {}