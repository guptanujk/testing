
import express, { Request, Response } from 'express';
import apiResponse from '../utilities/apiResponse';
import { HttpStatus } from '../constants/httpStatusCodes';
import commonService from '../services/common.service';
import { logger } from '../helper/log4js/logger';
import dashboardService from '../services/dashboard.service';

const getAgentsCounts = async (req: Request, res: Response) => {
  try {
    const agentsCount: any = await dashboardService.getAgentsCounts();
    return apiResponse.result(res, { agents: agentsCount?.count || 0 });
  } catch (error: unknown) {
    const err = commonService.isDBError(error) ? 'Something went wrong while fetching agents count ' : (error as Error).message;
    logger.error('Error at getAgentsCounts ctrl: ', (error as Error).message);
    return apiResponse.error(res,HttpStatus.INTERNAL_SERVER_ERROR,err);
  }
};

const getPolicyInfo = async (req: Request, res: Response) => {
  try {
    const activePolicyCount: any = await dashboardService.getActivePolicyCounts();
    console.log("activePolicyCount: ", activePolicyCount);
    let activePolicyCountData = activePolicyCount?.count || 0;
    const inactivePolicyCount: any = await dashboardService.getInactivePolicyCounts();
    console.log("inactivePolicyCount: ", inactivePolicyCount);
    let inactivePolicyCountData = inactivePolicyCount?.count || 0;
    return apiResponse.result(res, { 
      activePolicy: activePolicyCountData,
      inactivePolicy: inactivePolicyCountData,
      totalPolicy: activePolicyCountData + inactivePolicyCountData 
    });
  } catch (error: unknown) {
    const err = commonService.isDBError(error) ? 'Something went wrong while fetching policy info ' : (error as Error).message;
    logger.error('Error at getPolicyInfo ctrl: ', (error as Error).message);
    return apiResponse.error(res,HttpStatus.INTERNAL_SERVER_ERROR,err);
  }
};

const getClaimInfo = async (req: Request, res: Response) => {
  try {
    const claimCount: any = await dashboardService.getClaimCounts();
    console.log("claimCount: ", claimCount);
    let claimCountData = claimCount?.count || 0;
    const pendingClaimCount: any = await dashboardService.getClaimsCountByStatus(['Submitted']);
    console.log("pendingClaimCount: ", pendingClaimCount);
    let pendingClaimCountData = pendingClaimCount?.count || 0;
    const approvedClaimCount: any = await dashboardService.getClaimsCountByStatus(['Approved','Closed','Claim Issued']);
    console.log("approvedClaimCount: ", approvedClaimCount);
    let approvedClaimCountData = approvedClaimCount?.count || 0;
    const rejectedClaimCount: any = await dashboardService.getClaimsCountByStatus(['Rejected']);
    console.log("rejectedClaimCount: ", rejectedClaimCount);
    let rejectedClaimCountData = rejectedClaimCount?.count || 0;
    return apiResponse.result(res, { 
      totalClaims: claimCountData,
      pendingClaims: pendingClaimCountData,
      approvedClaims: approvedClaimCountData,
      rejectedClaims: rejectedClaimCountData
    });
  } catch (error: unknown) {
    const err = commonService.isDBError(error) ? 'Something went wrong while fetching claim info ' : (error as Error).message;
    logger.error('Error at getClaimInfo ctrl: ', (error as Error).message);
    return apiResponse.error(res,HttpStatus.INTERNAL_SERVER_ERROR,err);
  }
};

export default {
  getAgentsCounts,
  getPolicyInfo,
  getClaimInfo,
};
