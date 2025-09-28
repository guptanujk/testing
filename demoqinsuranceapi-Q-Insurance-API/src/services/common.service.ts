import db from '../config/mySqlDB';
import { ICountries, IGetStatesPayload, IPagination, IRecordsCount, IStates } from '../types/common';

const isDBError = (err: any) => {
  try {
    if (typeof err === 'string') {
      if (err.includes('_tenant_')) {
        return true;
      }
    } else if (typeof err === 'object') {
    if (err?.sqlState || err?.sql || err?.message?.includes('ER_PARSE_ERROR') || err?.code === 'ER_BAD_DB_ERROR' || err?.code === 'ER_NO_SUCH_TABLE') {
        return true;
      } else if (JSON.stringify(err) && JSON.stringify(err).includes('ER_PARSE_ERROR')) {
        return true;
      } else if (JSON.stringify(err) && JSON.stringify(err).includes('_tenant_')) {
        return true;
      } else if (err?.name === 'TypeError') {
        // handling type errors
        return true;
      }
    } else {
      return false;
    }
  } catch (error) {
    return;
  }
};

const getAllCountriesCount = () => {
  return new Promise<IRecordsCount>((resolve, reject) => {
    const query = `SELECT COUNT(*) as count FROM countries WHERE isActive=1;`;
    db.query(query, [], (err: any, result: any) => {
      if (err) {
        return reject(err);
      }
      const data = JSON.parse(JSON.stringify(result));
      return resolve(data[0]);
    });
  });
};

const getAllCountries = (payload: IPagination) => {
  return new Promise<ICountries[]>((resolve, reject) => {
    const query = `
      SELECT id, name, iso3 FROM countries
      WHERE isActive=1 ORDER BY name LIMIT ?,?;
    `;
    db.query(query, [payload.skip, payload.limit], (err: any, result: any) => {
      if (err) {
        return reject(err);
      }
      const data = JSON.parse(JSON.stringify(result));
      return resolve(data);
    });
  });
};

const getCountryById = (countryId: number) => {
  return new Promise<ICountries>((resolve, reject) => {
    const query = `SELECT id, name, iso3 FROM countries WHERE isActive=1 AND id=? LIMIT 1;`;
    db.query(query, [countryId], (err: any, result: any) => {
      if (err) {
        return reject(err);
      }
      const data = JSON.parse(JSON.stringify(result));
      return resolve(data[0]);
    });
  });
};

const getAllCountryStatesCount = (countryId: number) => {
  return new Promise<IRecordsCount>((resolve, reject) => {
    const query = `SELECT COUNT(*) as count FROM states WHERE isActive=1 AND countryId=? LIMIT 1;`;
    db.query(query, [countryId], (err: any, result: any) => {
      if (err) {
        return reject(err);
      }
      const data = JSON.parse(JSON.stringify(result));
      return resolve(data[0]);
    });
  });
};

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

export default {
  isDBError,
  getAllCountriesCount,
  getAllCountries,
  getCountryById,
  getAllCountryStatesCount,
  getAllCountryStates,
};