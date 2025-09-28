
import express, { Request, Response } from 'express';
import apiResponse from '../utilities/apiResponse';
import { HttpStatus } from '../constants/httpStatusCodes';
import commonService from '../services/common.service';
import commonController from './common.controller';
import { logger } from '../helper/log4js/logger';
import policyService from '../services/policy.service';
import { IPolicyBeneficiary, IPolicyInsurant } from '../types/policyTypes';
const moment = require('moment');

const createUserPolicy = async (req: Request, res: Response) => {
  try {
    // const dbName: string = process.env.MYSQLDATABASE;
    const {
      fullName, dob, gender, occupation, annualIncome, smokingStatus, alcoholConsumption, healthCondition, existingInsurance, existingInsuranceDetails,policyCategory,policySubCategory,
      desiredPolicyTerm, startDate, typeOfPolicy, desiredCoverageAmount,
      beneficiaryDetails,
      height, weight, medicalHistory, currentMedications, historyOfFamilyDiseases, surgeriesPast5Years, doctorsContact, consentToMedicalExam,
      phoneNumber, email, addressLine1, addressLine2, city, stateId, zipCode, countryId
    } = req.body;

    const currentUserId: number = req.user?.id ?? 0;
    const currentDate: string = moment().format('YYYY-MM-DD HH:mm:ss');
    
    if (policyCategory === 'vehicle' && !['car','bike','truck'].includes(policySubCategory)) {
      return apiResponse.error(
        res,HttpStatus.BAD_REQUEST,
        'Invalid policySubCategory for vehicle policyCategory. Expected values: car, bike, truck',
      );
    } else if (policyCategory === 'health' && !['individual','family','senior citizen'].includes(policySubCategory)) {
      return apiResponse.error(
        res,HttpStatus.BAD_REQUEST,
        'Invalid policySubCategory for health policyCategory. Expected values: individual, family, seniorCitizen',
      );
    } else if (policyCategory === 'travel' && !['holiday','business','student'].includes(policySubCategory)) {
      return apiResponse.error(
        res,HttpStatus.BAD_REQUEST,
        'Invalid policySubCategory for travel policyCategory. Expected values: holiday, business, student',
      );
    } else if (policyCategory === 'term' && !['individual','joint','group'].includes(policySubCategory)) {
      return apiResponse.error(
        res,HttpStatus.BAD_REQUEST,
        'Invalid policySubCategory for term policyCategory. Expected values: individual, joint, group',
      );
    }

    if (!moment(dob, 'YYYY-MM-DD').isValid()) {
      return apiResponse.error(
        res,HttpStatus.BAD_REQUEST,
        'Invalid date format for dob. Expected format: YYYY-MM-DD',
      );
    }
    const age: number = await policyService.calculatAge(dob);
    // startDate & endDate should be in UTC
    if (!moment(startDate, 'YYYY-MM-DD HH:mm:ss').isValid()) {
      return apiResponse.error(
        res,HttpStatus.BAD_REQUEST,
        'Invalid date format for startDate. Expected format: YYYY-MM-DD',
      );
    }
    const endDate: string = moment(startDate, 'YYYY-MM-DD HH:mm:ss').add(desiredPolicyTerm, 'years').format('YYYY-MM-DD HH:mm:ss');
    let premium: number = await policyService.calculatePremiumAmount({
      age,
      policyCategory,
      policySubCategory,
      typeOfPolicy,
      desiredCoverageAmount,
      annualIncome,
      smokingStatus,
      alcoholConsumption
    });
    const policyId = await policyService.generatePolicyId(policyCategory);
    const userPolicyPayload = {
      fullName, dob, existingInsurance, existingInsuranceDetails, phoneNumber,
      policyCategory,policySubCategory,typeOfPolicy, desiredCoverageAmount, premium,
      startDate, endDate, desiredPolicyTerm,
      email: email.trim().toLowerCase(),
      currentUserId, currentDate, policyId
    }
    const userPolicy = await policyService.createUserPolicy(userPolicyPayload);
    const userPolicyId = (userPolicy as any)?.insertId ?? 0;
    let beneficiaries: [IPolicyBeneficiary] = [] as unknown as [IPolicyBeneficiary];
    for (let beneficiary of beneficiaryDetails) {
      try {
        const { beneficiaryName, beneficiaryRelation, beneficiaryPhone, beneficiaryEmail } = beneficiary;
        const beneficiaryPayload: IPolicyBeneficiary = {
          fullName: beneficiaryName, 
          relationship: beneficiaryRelation, 
          phoneNumber: beneficiaryPhone,
          email: beneficiaryEmail,
          currentDate, userPolicyId, currentUserId };
        beneficiaries.push(beneficiaryPayload);
        
      } catch (error) {
        console.log(error);
      }
    }
    await policyService.createPolicyBeneficiary(beneficiaries);

    const insurantPayload = {
      gender, occupation, userPolicyId, fullName, dob,
      annualIncome, smokingStatus, alcoholConsumption, healthConditions: healthCondition,
      height, weight, medicalHistory, currentMedications, historyOfFamilyDiseases, surgeriesPast5Years, doctorsContact, consentMedicalExam: consentToMedicalExam,
      addressLine1, addressLine2, city, stateId, zipCode, countryId, currentUserId, currentDate
    }

    await policyService.createPolicyInsurant(insurantPayload);

    // add beneficiary details and other details in separate tables
    return apiResponse.result(
      res,
      { userPolicyId, policyId },
      HttpStatus.OK,
      'Policy created successfully.',      
    );

  } catch (error: unknown) {
    const err = commonService.isDBError(error) ? 'Something went wrong while checking data' : (error as Error).message;
    logger.error('Error at loginVerification ctrl: ', (error as Error).message);
    return apiResponse.error(
      res,
      HttpStatus.INTERNAL_SERVER_ERROR,
      err,
    );
  }
}

const getPoliciesList = async (req: any, res: any) => {
    try {
        const { limit, skip, page } = await commonController.paginationValidation(
            res,
            req.body.limit,
            req.body.page,
        );

        const searchString: string = req.body.search;
        let createdOn = req.body.createdOn;
        const category = req.body.category;
        const status = req.body.status;

        if (createdOn && (!moment(createdOn).isValid())) {
            return apiResponse.error(res, HttpStatus.BAD_REQUEST, `Invalid createdOn date.`);
        }

        createdOn = createdOn ? moment(createdOn).format('YYYY-MM-DD') : '';

        let totalCount: any;

        let policiesCount: any = await policyService.getPoliciesCount(req.user.id, searchString, category, createdOn, status);
        totalCount = policiesCount?.count ? policiesCount?.count : 0;

        if (totalCount === 0) {
            return apiResponse.result(res, { limit, page, totalCount, policies: [] });
        }

        const policies: any = await policyService.getPoliciesList(req.user.id, searchString, category, createdOn, status, limit, skip);

        if (!policies || !policies.length) {
            return apiResponse.result(res, { limit, page, totalCount, policies: [] });
        } else {
            return apiResponse.result(res, { limit, page, totalCount, policies });
        }

    } catch (error: any) {
        const err = commonService.isDBError(error) ? 'Something went wrong while fetching data' : error.message;
        logger.error("Error at getPoliciesList ctrl: ", error?.message)
        return apiResponse.error(res, HttpStatus.INTERNAL_SERVER_ERROR, err);
    }
};



export default {
  createUserPolicy,
  getPoliciesList
};


