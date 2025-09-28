import { MysqlError, OkPacket } from 'mysql';
import db from '../config/mySqlDB';
import { ICountries, IGetStatesPayload, IPagination, IRecordsCount, IStates } from '../types/common';
import { IClaimListPayload } from '../types/claimTypes';

const getAllCountryStates = (payload: IGetStatesPayload) => {
  return new Promise<IStates[]>((resolve, reject) => {
    const query = `
      SELECT id, name, iso2, countryId FROM states
      WHERE isActive=1 AND countryId=?
      ORDER BY name LIMIT ?, ?;
    `;
    db.query(query, [payload.countryId, payload.skip, payload.limit], (err: any, result: any) => {
      if (err) {
        return reject(err);
      }
      const data = JSON.parse(JSON.stringify(result));
      return resolve(data);
    });
  });
};

const createClaim = (claimData: any) => {
  return new Promise<OkPacket>((resolve, reject) => {
    const query = `
      INSERT INTO claims (userPolicyId, amount, status, createdBy, createdAt, updatedBy, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?);
    `;
    const params = [
      claimData.userPolicyId,
      claimData.claimAmount,
      "Submitted",
      claimData.currentUserId,
      claimData.currentDate,
      claimData.currentUserId,
      claimData.currentDate,
    ];
    console.log('Create Claim Query:', query, params); // Debug log
    db.query(query, params, (err: MysqlError, result: OkPacket) => {
      if (err) {
        return reject(err);
      }
      const data = JSON.parse(JSON.stringify(result));
      return resolve(data);
    });
  });
};

const addClaimHistory = (historyData: any) => {
  return new Promise<OkPacket>((resolve, reject) => {
    const query = `
      INSERT INTO claim_status_history (claimId, status, createdBy, createdAt, updatedBy, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?);
    `;
    const params = [
      historyData.claimId,
      historyData.status,
      historyData.currentUserId,
      historyData.currentDate,
      historyData.currentUserId,
      historyData.currentDate,
    ];
    db.query(query, params, (err: MysqlError, result: OkPacket) => {
      if (err) {
        console.log("Error in addClaimHistory: ", err);
        return reject(err);
      }
      const data = JSON.parse(JSON.stringify(result));
      return resolve(data);
    });
  });
};

const addClaimRemarks = (remarksData: any) => {
  return new Promise<OkPacket>((resolve, reject) => {
    const query = `
      INSERT INTO claim_remarks (claimId, remarks, user, status, createdBy, createdAt, updatedBy, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `;
    const params = [
      remarksData.claimId,
      remarksData.remark,
      remarksData.user,
      remarksData.status,
      remarksData.currentUserId,
      remarksData.currentDate,
      remarksData.currentUserId,
      remarksData.currentDate,
    ];
    db.query(query, params, (err: MysqlError, result: OkPacket) => {
      if (err) {
        return reject(err);
      }
      const data = JSON.parse(JSON.stringify(result));
      return resolve(data);
    });
  });
}

const getClaimsCount = (payload: IClaimListPayload) => {
  return new Promise<IRecordsCount>((resolve, reject) => {
    let query = `
      SELECT COUNT(*) as count FROM claims c 
      LEFT JOIN user_policies up ON c.userPolicyId = up.id
      WHERE c.isActive=1
    `;
    const params: any[] = [];
    if (!payload.isAdmin) {
      query += ` AND c.createdBy = ? `;
      params.push(payload.currentUserId);
    }
    // const params: any[] = [currentUserId];
    if (payload.search && payload.search.trim() !== '') {
      query += ` AND (c.id LIKE ? OR c.status LIKE ?)`;
      params.push(`%${payload.search}%`, `%${payload.search}%`);
    }
    if (payload.status && payload.status.trim() !== '') {
      query += ` AND c.status = ?`;
      params.push(payload.status);
    }
    if (payload.createdOn && payload.createdOn.trim() !== '') {
      query += ` AND DATE(c.createdAt) = ?`;
      params.push(payload.createdOn);
    }
    if(payload.category && payload.category.trim() !== '') {
      query += ` AND up.policyCategory = ?`;
      params.push(payload.category);
    }
    console.log("getClaimsCount Query: ", query, params); // Debug log
    db.query(query, params, (err: MysqlError, result: any) => {
      if (err) {
        return reject(err);
      }
      const data = JSON.parse(JSON.stringify(result))[0];
      return resolve(data);
    });
  });
}
const getClaimsList = (payload: IClaimListPayload) => {
  return new Promise<any[]>((resolve, reject) => {
    let query = `
      SELECT c.id, c.userPolicyId, c.amount, c.status, c.createdAt, up.policyId, up.policyCategory,
      up.policySubCategory, up.typeOfPolicy, up.startDate, up.endDate, up.desiredCoverageAmount as coverageAmount, up.phoneNumber, up.email,
      IF(csh.claimId is null,'[]', JSON_ARRAYAGG(
        JSON_OBJECT('claimId', csh.claimId, 'status', csh.status, 'createdAt', csh.createdAt)
      )) AS statusHistory
      FROM claims c
      LEFT JOIN user_policies up ON c.userPolicyId = up.id
      LEFT JOIN claim_status_history csh ON c.id = csh.claimId
      WHERE c.isActive=1
    `;
    // const params: any[] = [payload.currentUserId];
    const params: any[] = [];
    if (!payload.isAdmin) {
      query += ` AND c.createdBy = ? `;
      params.push(payload.currentUserId);
    }
    if (payload.search && payload.search.trim() !== '') {
      query += ` AND (c.id LIKE ? OR c.status LIKE ?)`;
      params.push(`%${payload.search}%`, `%${payload.search}%`);
    }
    if (payload.status && payload.status.trim() !== '') {
      query += ` AND c.status = ?`;
      params.push(payload.status);
    }
    if (payload.createdOn && payload.createdOn.trim() !== '') {
      query += ` AND DATE(c.createdAt) = ?`;
      params.push(payload.createdOn);
    }
    if (payload.category && payload.category.trim() !== '') {
      query += ` AND up.policyCategory = ?`;
      params.push(payload.category);
    }
    query += ` GROUP BY c.id ORDER BY c.createdAt DESC LIMIT ? OFFSET ?`;
    params.push(payload.limit, payload.skip);
    console.log("getClaims list Query: ", query, params); // Debug log
    db.query(query, params, (err: MysqlError, result: any) => {
      if (err) {
        return reject(err);
      }
      const data = JSON.parse(JSON.stringify(result));
      return resolve(data);
    });
  });
}

const getClaimById = (claimId: number) => {
  return new Promise<any>((resolve, reject) => {
    const query = `
      SELECT * FROM claims WHERE id = ? AND isActive=1 LIMIT 1;
    `;
    db.query(query, [claimId], (err: MysqlError, result: any) => {
      if (err) {
        return reject(err);
      }
      const data = JSON.parse(JSON.stringify(result))[0];
      return resolve(data);
    });
  });
}

const updateClaimStatus = (payload: any) => {
  return new Promise<OkPacket>((resolve, reject) => {
    const query = `
      UPDATE claims SET status=?, updatedBy=?, updatedAt=? WHERE id=? AND isActive=1;
    `;
    const params = [
      payload.status,
      payload.currentUserId,
      payload.currentDate,
      payload.claimId,
    ];
    console.log('Update Claim Status Query:', query, params); // Debug log
    db.query(query, params, (err: MysqlError, result: OkPacket) => {
      if (err) {
        return reject(err);
      }
      const data = JSON.parse(JSON.stringify(result));
      return resolve(data);
    });
  });
}

const getClaimRemarks = (claimId: number) => {
  return new Promise<any[]>((resolve, reject) => {
    const query = `
      SELECT * FROM claim_remarks
      WHERE claimId = ? AND isActive=1 ORDER BY createdAt DESC;
    `;
    db.query(query, [claimId], (err: MysqlError, result: any) => {
      if (err) {
        return reject(err);
      }
      const data = JSON.parse(JSON.stringify(result));
      return resolve(data);
    });
  });
}

export default {
  updateClaimStatus,
  getClaimById,
  createClaim,
  getAllCountryStates,
  addClaimHistory,
  addClaimRemarks,
  getClaimsCount,
  getClaimsList,
  getClaimRemarks
};