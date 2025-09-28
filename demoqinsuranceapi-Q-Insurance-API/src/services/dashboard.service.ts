import { MysqlError, OkPacket } from 'mysql';
import db from '../config/mySqlDB';
import { ICountries, IGetStatesPayload, IPagination, IRecordsCount, IStates } from '../types/common';
import { IClaimListPayload } from '../types/claimTypes';

const getAgentsCounts = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT count(*) as count FROM users
      WHERE isActive=1 AND type='Agent';
    `;
    db.query(query, (err: any, result: any) => {
      if (err) {
        return reject(err);
      }
      const data = JSON.parse(JSON.stringify(result));
      return resolve(data[0]);
    });
  });
};

const getActivePolicyCounts = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT COUNT(*) as count FROM user_policies up
      WHERE up.isActive=1 AND up.endDate >= CURDATE();
    `;
    db.query(query, (err: any, result: any) => {
      if (err) {
        return reject(err);
      }
      const data = JSON.parse(JSON.stringify(result));
      return resolve(data[0]);
    });
  });
}

const getInactivePolicyCounts = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT COUNT(*) as count FROM user_policies up
      WHERE up.isActive=0 OR up.endDate < CURDATE();
    `;
    db.query(query, (err: any, result: any) => {
      if (err) {
        return reject(err);
      }
      const data = JSON.parse(JSON.stringify(result));
      return resolve(data[0]);
    });
  });
};

const getClaimCounts = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT COUNT(*) as count FROM claims c
      WHERE c.isActive=1;
    `;
    db.query(query, (err: any, result: any) => {
      if (err) {
        return reject(err);
      }
      const data = JSON.parse(JSON.stringify(result));
      return resolve(data[0]);
    });
  });
}

const getClaimsCountByStatus = (status: string[]) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT COUNT(*) as count FROM claims c
      WHERE c.isActive=1 AND c.status IN (?)
    `;
    db.query(query, [status], (err: any, result: any) => {
      if (err) {
        return reject(err);
      }
      const data = JSON.parse(JSON.stringify(result));
      return resolve(data[0]);
    });
  });
}

export default {
  getAgentsCounts,
  getActivePolicyCounts,
  getInactivePolicyCounts,
  getClaimCounts,
  getClaimsCountByStatus,
};