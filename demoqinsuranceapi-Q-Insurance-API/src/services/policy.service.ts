import moment from 'moment';
import db from '../config/mySqlDB';
import { AgeFactor, CoverageFactor, ICalculatePremiumAmount, ICreateUserPolicy, IPolicyBeneficiary, IPolicyInsurant } from '../types/policyTypes';
import { MysqlError, OkPacket } from 'mysql';

const calculatAge = (date: string) => {
  return new Promise<number>((resolve, reject) => {
    const today = moment();
    const age = today.diff(moment(date), 'years');
    return resolve(age);
  });
}

const coverageFactors: CoverageFactor = {
  "5000000": 0.31,
  "7000000": 0.44,
  "10000000": 0.63,
  "20000000": 1.0,
  "30000000": 1.44,
  "40000000": 1.88,
  "50000000": 2.31,
};

const ageFactors: AgeFactor[] = [
  { range: [20, 25], factor: 1.0 },
  { range: [26, 30], factor: 1.2 },
  { range: [31, 35], factor: 1.44 },
  { range: [36, 40], factor: 1.8 },
  { range: [41, 45], factor: 2.38 },
  { range: [46, 50], factor: 3.25 },
  { range: [51, 55], factor: 4.63 },
  { range: [56, 60], factor: 6.88 },
];

function getAgeFactor(age: number): number {
  const match = ageFactors.find(a => age >= a.range[0] && age <= a.range[1]);
  if (!match) throw new Error("Age not supported (only 20-60).");
  return match.factor;
}

const calculatePremiumAmount = (data: ICalculatePremiumAmount) => {
  return new Promise<number>((resolve, reject) => {
    const BASE_PREMIUM = 16000;
    console.log("data.desiredCoverageAmount: ", data.desiredCoverageAmount)
    const coverageFactor = coverageFactors[data.desiredCoverageAmount];
    console.log("coverageFactor: ", coverageFactor)
    const ageFactor = getAgeFactor(data.age);
    console.log("ageFactor: ", ageFactor)
    const premium = BASE_PREMIUM * coverageFactor * ageFactor;
    console.log("premium: ", premium)
    const PremiumAmount: number = Math.round(premium / 500) * 500;
    console.log("PremiumAmount: ", PremiumAmount)
    return resolve(PremiumAmount);
  });
};

const POLICY_PREFIX: Record<string, string> = {
  term: 'TI',
  health: 'HI',
  vehicles: 'VI',
  travel: 'TRI'
};

const getLatestPolicyByInsurType = (policyCategory: string) => {
  return new Promise<{policyId: string}>((resolve, reject) => {
    const query = `
      SELECT policyId FROM user_policies 
      WHERE policyCategory = ? 
      ORDER BY id DESC LIMIT 1
    `;
    db.query(query, [policyCategory], (err: MysqlError, result: any) => {
      if (err) {
        return reject(err);
      }
      const data = JSON.parse(JSON.stringify(result));
      return resolve(data[0]);
    });
  });
};

async function generatePolicyId(policyCategory: string): Promise<string> {
  return new Promise(async(resolve, reject) => {
    const prefix = POLICY_PREFIX[policyCategory];
    if (!prefix) throw new Error('Invalid insurance type');

    const latestRows = await getLatestPolicyByInsurType(policyCategory);

    let newNumber = 1;
    if (latestRows?.policyId) {
      const lastPolicyId = latestRows?.policyId; // e.g., TI00004
      const lastNumber = parseInt(lastPolicyId.replace(prefix, ''), 10);
      newNumber = lastNumber + 1;
    }

    // Format as prefix + padded number (5 digits)
    return resolve(`${prefix}${newNumber.toString().padStart(5, '0')}`);
  });
}

const createUserPolicy = (userPolicy: ICreateUserPolicy) => {
  return new Promise<OkPacket>(async(resolve, reject) => {
    // let temp = userPolicy.
    const query = `INSERT INTO user_policies (
      userId, existingPolicy, existingPolicyDetails, policyId,
      policyCategory, policySubCategory, typeOfPolicy, desiredCoverageAmount, premium,
      startDate, endDate, desiredPolicyTerm,
      email, phoneNumber, createdBy, createdAt, updatedBy, updatedAt
    ) VALUES ? `;
    const values: any = [];
    values.push([
      userPolicy.currentUserId, userPolicy.existingInsurance ? 1 : 0, userPolicy.existingInsuranceDetails || null, userPolicy.policyId,
      userPolicy.policyCategory, userPolicy.policySubCategory, userPolicy.typeOfPolicy, userPolicy.desiredCoverageAmount, userPolicy.premium,
      userPolicy.startDate, userPolicy.endDate, userPolicy.desiredPolicyTerm,
      userPolicy.email, userPolicy.phoneNumber, userPolicy.currentUserId, userPolicy.currentDate, userPolicy.currentUserId, userPolicy.currentDate,
    ]);
    db.query(query, [values], (err: MysqlError, result: OkPacket) => {
      if (err) {
        return reject(err);
      }
      return resolve(result);
    });
  });
};

const createPolicyBeneficiary = (beneficiaries: any) => {
  return new Promise<OkPacket>(async(resolve, reject) => {
    // let temp = userPolicy.
    const query = `INSERT INTO user_policy_beneficiary_details (
      fullName, relationship, share, userPolicyId,
      email, phoneNumber,
      createdBy, createdAt, updatedBy, updatedAt
    ) VALUES ? `;
    const values: any = [];
    beneficiaries.forEach((beneficiary: IPolicyBeneficiary) => {
    values.push([
      beneficiary.fullName, 
      beneficiary.relationship, 
      100, 
      beneficiary.userPolicyId,
      beneficiary.email, 
      beneficiary.phoneNumber, 
      beneficiary.currentUserId, 
      beneficiary.currentDate, 
      beneficiary.currentUserId, 
      beneficiary.currentDate,
    ]);
    });
    db.query(query, [values], (err: MysqlError, result: OkPacket) => {
      if (err) {
        return reject(err);
      }
      return resolve(result);
    });
  });
};
const createPolicyInsurant = (insurant: IPolicyInsurant) => {
  return new Promise<OkPacket>(async(resolve, reject) => {
    // let temp = userPolicy.
    const query = `INSERT INTO user_policy_insurant_details (
      userPolicyId,
      fullName,
      dob,
      gender,
      occupation,
      annualIncome,
      smokingStatus,
      alcoholConsumption,
      healthConditions,
      height,
      weight,
      medicalHistory,
      currentMedications,
      historyOfFamilyDiseases,
      surgeriesPast5Years,
      doctorsContact,
      consentMedicalExam,
      addressLine1,
      addressLine2,
      city,
      stateId,
      zipCode,
      countryId,
      createdBy, createdAt, updatedBy, updatedAt
    ) VALUES ? `;
    const values: any = [];
    values.push([
      insurant.userPolicyId,
      insurant.fullName,
      insurant.dob,
      insurant.gender,
      insurant.occupation,
      insurant.annualIncome,
      insurant.smokingStatus,
      insurant.alcoholConsumption,
      insurant.healthConditions,
      insurant.height,
      insurant.weight,
      insurant.medicalHistory,
      insurant.currentMedications,
      insurant.historyOfFamilyDiseases,
      insurant.surgeriesPast5Years,
      insurant.doctorsContact,
      insurant.consentMedicalExam,
      insurant.addressLine1,
      insurant.addressLine2,
      insurant.city,
      insurant.stateId,
      insurant.zipCode,
      insurant.countryId,
      insurant.currentUserId, 
      insurant.currentDate, 
      insurant.currentUserId, 
      insurant.currentDate,
    ]);
    db.query(query, [values], (err: MysqlError, result: OkPacket) => {
      if (err) {
        return reject(err);
      }
      return resolve(result);
    });
  });
};

const getPoliciesCount = (userId: Number, searchString: string, category: string, createdOn: string, status: string) => {
    return new Promise(async (resolve, reject) => {
        try {
            let concatQuery: string = '';
            let values: any = [];

            values.push(userId);

            if (createdOn) {
                concatQuery = `${concatQuery} AND createdAt BETWEEN ? and ?`;
                values.push(`${createdOn} 00:00:00`, `${createdOn} 23:59:59`);
            }
           
            if (category) {
                concatQuery = `${concatQuery} AND policyCategory = ?`;
                values.push(category);
            }
            if (status) {
              const today = new Date();
                if (status === 'active') {
                    concatQuery = `${concatQuery} AND endDate >= ? `;
                    values.push(today);
                }
                else if (status === 'inactive') {
                    concatQuery = `${concatQuery} AND endDate < ? `;
                    values.push(today);
                } 
            }

            let searchQuery = `AND (policyId like ? )`;
            if (searchString) {
                values.push(`%${searchString}%`);
            }

            let query = `SELECT count(*) as count from user_policies where isActive=1 AND userId=?  
            ${concatQuery} ${searchString ? searchQuery : ''}  `;
            console.log(query)
            db.query(query, values, (err: any, result: any) => {
                if (err) {
                    return reject(err);
                }
                const data = JSON.parse(JSON.stringify(result));
                return resolve(data[0]);
            });
        } catch (err: any) {
            console.log(err)
            return reject(err);
        }
    });
};

const getPoliciesList = (userId: Number, searchString: string, category: string, createdOn: string, status: string, limit: Number, skip: Number) => {
    return new Promise(async (resolve, reject) => {
        try {
            let concatQuery: string = '';
            let values: any = [];

            values.push(userId);

            if (createdOn) {
                concatQuery = `${concatQuery} AND createdAt BETWEEN ? and ?`;
                values.push(`${createdOn} 00:00:00`, `${createdOn} 23:59:59`);
            }
           
            if (category) {
                concatQuery = `${concatQuery} AND policyCategory = ?`;
                values.push(category);
            }
            if (status) {
              const today = new Date();
                if (status === 'active') {
                    concatQuery = `${concatQuery} AND endDate >= ? `;
                    values.push(today);
                }
                else if (status === 'inactive') {
                    concatQuery = `${concatQuery} AND endDate < ? `;
                    values.push(today);
                } 
            }

            let searchQuery = `AND (policyId like ? )`;
            if (searchString) {
                values.push(`%${searchString}%`);
            }

            let query = `SELECT id,policyId, userId, policyCategory, policySubCategory, createdAt, email, phoneNumber,
            CASE WHEN endDate >= CURDATE() THEN 'active' ELSE 'inactive' END AS status
            from user_policies where isActive=1 AND userId=?  
            ${concatQuery} ${searchString ? searchQuery : ''}  LIMIT ?, ? `;

            values.push(skip, limit);

            console.log('query', query, values);
            db.query(query, values, (err: any, result: any) => {
                if (err) {
                    return reject(err);
                }
                const data = JSON.parse(JSON.stringify(result));
                return resolve(data);
            });
        } catch (err: any) {
            console.log(err)
            return reject(err);
        }
    });
};

export default {
  calculatAge,
  calculatePremiumAmount, 
  createUserPolicy,
  generatePolicyId,
  createPolicyBeneficiary,
  createPolicyInsurant,
  getPoliciesCount,
  getPoliciesList
};