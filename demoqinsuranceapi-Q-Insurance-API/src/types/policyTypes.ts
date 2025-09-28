export interface ICalculatePremiumAmount {
  age: number,
  policyCategory: string,
  policySubCategory: string,
  typeOfPolicy: string,
  desiredCoverageAmount: number,
  annualIncome?: number,
  smokingStatus?: boolean,
  alcoholConsumption?: boolean,
}

export interface ICreateUserPolicy {
  fullName: string,
  dob: string,
  existingInsurance: boolean,
  existingInsuranceDetails?: string,
  policyCategory: string,
  policySubCategory: string,
  typeOfPolicy: string,
  desiredCoverageAmount: number,
  premium: number,
  startDate: string,
  endDate: string,
  desiredPolicyTerm: number,
  email: string,
  currentUserId: number,
  currentDate: string,
  policyId: string,
  phoneNumber: number,
}

export interface IPolicyBeneficiary {
  fullName: string,
  relationship: string,
  userPolicyId: number,
  email: string,
  phoneNumber: number,
  currentUserId: number,
  currentDate: string,
}

export interface IPolicyInsurant {
  userPolicyId: number,
  fullName: string,
  dob: string,
  gender: string,
  occupation: string,
  annualIncome: number,
  smokingStatus: boolean,
  alcoholConsumption: boolean,
  healthConditions: string,
  height: number,
  weight: number,
  medicalHistory: string,
  currentMedications: string,
  historyOfFamilyDiseases: string,
  surgeriesPast5Years: boolean,
  doctorsContact: string,
  consentMedicalExam: boolean,
  currentUserId: number,
  currentDate: string,
  addressLine1: string, 
  addressLine2: string, 
  city: string, 
  stateId: number, 
  zipCode: number, 
  countryId: number,
}

export type CoverageOption = 5000000 | 7000000 | 10000000 | 20000000 | 30000000 | 40000000 | 50000000; 

export interface CoverageFactor {
  [key: number]: number;
}
export interface AgeFactor {
  range: [number, number];
  factor: number;
}
