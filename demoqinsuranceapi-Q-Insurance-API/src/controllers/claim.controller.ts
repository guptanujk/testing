
import express, { Request, Response } from 'express';
import apiResponse from '../utilities/apiResponse';
import { HttpStatus } from '../constants/httpStatusCodes';
import commonService from '../services/common.service';
import commonController from './common.controller';
import claimService from '../services/claim.service';
import { logger } from '../helper/log4js/logger';
import moment from 'moment';


const createClaim = async (req: Request, res: Response) => {
  try {
    const currentUserId: number = req.user?.id ?? 0;
    const currentDate: string = moment().format('YYYY-MM-DD HH:mm:ss');
    const userPolicyId: number = req?.body?.userPolicyId ?? 0;
    const remark: string = req?.body?.remark ?? '';
    const claimAmount: number = req?.body?.amount ?? 0;
    const claimData = {
      userPolicyId,
      remark,
      claimAmount,
      currentUserId,
      currentDate,
    };
    // 1. Check if userPolicyId exists and status is 'Active'
    // 2. check any existing claim with status 'Rejected' or 'closed' for the same userPolicyId
    const claimResult = await claimService.createClaim(claimData);
    if (!claimResult) {
      return apiResponse.error(
        res,HttpStatus.BAD_REQUEST,
        'Something went wrong while creating claim data',
      );
    }
    const claimId = claimResult?.insertId ?? 0;
    if (claimId == 0) {
      return apiResponse.error(
        res,HttpStatus.BAD_REQUEST,
        'Claim creation failed',
      );
    }
    await claimService.addClaimHistory({
      claimId,
      status: 'Submitted',
      currentUserId,
      currentDate,
    });
    await claimService.addClaimRemarks({
      claimId,
      remark,
      user: 'Agent',
      status: 'Submitted',
      currentUserId,
      currentDate,
    });
    return apiResponse.result(
      res,
      { claimId },
      HttpStatus.OK,
      'Claim created successfully.',
    );
  } catch (error: unknown) {
    const err = commonService.isDBError(error) ? 'Something went wrong while creating claim data' : (error as Error).message;
    logger.error('Error at createClaim ctrl: ', (error as Error).message);
    return apiResponse.error(
      res,
      HttpStatus.INTERNAL_SERVER_ERROR,
      err,
    );
  }
}
const getClaimsList = async (req: Request, res: Response) => {
  try {
    console.log("req.user?: ", req.user)
    const currentUserId: number = req.user?.id ?? 0;
    const search: string = req?.body?.search ?? '';
    const status: string = req?.body?.status ?? '';
    const category: string = req?.body?.category ?? '';
    let createdOn: string = req?.body?.createdOn ?? '';
    const { limit, skip, page } = await commonController.paginationValidation(res,req.body.limit,req.body.page);
    if (createdOn && (!moment(createdOn).isValid())) {
        return apiResponse.error(res, HttpStatus.BAD_REQUEST, `Invalid createdOn date.`);
    }
    createdOn = createdOn ? moment(createdOn).format('YYYY-MM-DD') : '';
    let isAdmin = req.user?.type === 'Agent' ? false : true;
    let claimsListPayload = {
      currentUserId, search, status, createdOn, category,
      limit, skip, page, isAdmin,
    };
    let claimsCount: any = await claimService.getClaimsCount(claimsListPayload);
    const totalCount = claimsCount?.count ? claimsCount?.count : 0;
    if (totalCount === 0) {
      return apiResponse.result(res, { limit, page, totalCount, claims: [] });
    }
    const claimsList = await claimService.getClaimsList(claimsListPayload);
    if (!claimsList || !claimsList.length) {
      return apiResponse.result(res, { limit, page, totalCount, claims: [] });
    } else {
      claimsList.forEach((claim: any) => {
        if (claim.statusHistory && typeof claim.statusHistory === 'string') {
          try {
            claim.statusHistory = JSON.parse(claim.statusHistory);
          }
          catch (e) {
            claim.statusHistory = [];
          }
        } else {
          claim.statusHistory = [];
        }
      });
      return apiResponse.result(res, { limit, page, totalCount, claims: claimsList });
    }
  } catch (error: unknown) {
    const err = commonService.isDBError(error) ? 'Something went wrong while fetching claims list' : (error as Error).message;
    logger.error('Error at getClaimsList ctrl: ', (error as Error).message);
    return apiResponse.error(res,HttpStatus.INTERNAL_SERVER_ERROR,err);
  }
};

const updateClaimStatus = async (req: Request, res: Response) => {
  try {
    const currentUserId: number = req.user?.id ?? 0;
    const currentDate: string = moment().format('YYYY-MM-DD HH:mm:ss');
    const claimId: number = req?.body?.claimId ?? 0;
    const status: string = req?.body?.status ?? '';
    const remark: string = req?.body?.remark ?? '';
    const validStatuses: any = {
      'Claim Issued': ['Closed'],
      'Approved': ['Claim Issued'],
      'Rejected': ['Closed'],
      'Closed': [],
      'Submitted': ['Approved', 'Rejected'],
    }
    
    let isAdmin = req.user?.type === 'Agent' ? false : true;
    if (!isAdmin) {
      return apiResponse.error(res,HttpStatus.FORBIDDEN,'You do not have permission to update claim status');
    }
    
    const claim = await claimService.getClaimById(claimId);
    if (!claim) {
      return apiResponse.error(res,HttpStatus.BAD_REQUEST,'Invalid claimId');
    }
    if (claim.status === 'Closed') {
      return apiResponse.error(res,HttpStatus.BAD_REQUEST,`Cannot update status of a ${claim.status} claim, because it is Closed already.`);
    }
    if (validStatuses[claim.status].indexOf(status) === -1) {
      return apiResponse.error(res,HttpStatus.BAD_REQUEST,`Invalid status transition from ${claim.status} to ${status}.`);
    }

    await claimService.updateClaimStatus({
      claimId,
      status,
      currentUserId,
      currentDate,
    });
    await claimService.addClaimHistory({
      claimId,
      status,
      currentUserId,
      currentDate,
    });
    await claimService.addClaimRemarks({
      claimId,
      remark,
      user: 'Admin',
      status,
      currentUserId,
      currentDate,
    });
    return apiResponse.result(res, { claimId }, HttpStatus.OK, 'Claim status updated successfully.');
  } catch (error: unknown) {
    const err = commonService.isDBError(error) ? 'Something went wrong while updating claims status' : (error as Error).message;
    logger.error('Error at updateClaimStatus ctrl: ', (error as Error).message);
    return apiResponse.error(res,HttpStatus.INTERNAL_SERVER_ERROR,err);
  }
};

const createRemarkLog = async (req: Request, res: Response) => {
  try {
    const currentUserId: number = req.user?.id ?? 0;
    const currentDate: string = moment().format('YYYY-MM-DD HH:mm:ss');
    const claimId: number = req?.body?.claimId ?? 0;
    const remark: string = req?.body?.remark ?? '';
    let responsibleUser = req.user?.type === 'Admin' ? 'Admin' : 'Agent';

    const claim = await claimService.getClaimById(claimId);
    if (!claim) {
      return apiResponse.error(res,HttpStatus.BAD_REQUEST,'Invalid claimId');
    }
    await claimService.addClaimRemarks({
      claimId,
      remark,
      user: responsibleUser,
      status: '',
      currentUserId,
      currentDate,
    });
    return apiResponse.result(
      res,
      {},
      HttpStatus.OK,
      'Remark added successfully.',
    );
  } catch (error: unknown) {
    const err = commonService.isDBError(error) ? 'Something went wrong while adding remark' : (error as Error).message;
    logger.error('Error at createRemarkLog ctrl: ', (error as Error).message);
    return apiResponse.error(res,HttpStatus.INTERNAL_SERVER_ERROR,err);
  }
};

const getRemarkHistory = async (req: Request, res: Response) => {
  try {
    const claimId: number = parseInt(req.params.claimId) ?? 0;
    const claim = await claimService.getClaimById(claimId);
    if (!claim) {
      return apiResponse.error(res,HttpStatus.BAD_REQUEST,'Invalid claimId');
    }
    const remarks = await claimService.getClaimRemarks(claimId);
    return apiResponse.result(res, { remarks });
  } catch (error: unknown) {
    const err = commonService.isDBError(error) ? 'Something went wrong while fetching remark history' : (error as Error).message;
    logger.error('Error at getRemarkHistory ctrl: ', (error as Error).message);
    return apiResponse.error(res,HttpStatus.INTERNAL_SERVER_ERROR,err);
  }
};

const reclaim = async (req: Request, res: Response) => {
  try {
    const currentUserId: number = req.user?.id ?? 0;
    const currentDate: string = moment().format('YYYY-MM-DD HH:mm:ss');
    const claimId: number = parseInt(req.params.claimId) ?? 0;
    const remark: string = req?.body?.remark ?? '';

    const claim = await claimService.getClaimById(claimId);
    if (!claim) {
      return apiResponse.error(res,HttpStatus.BAD_REQUEST,'Invalid claimId');
    }
    if (claim.status !== 'Rejected') {
      return apiResponse.error(res,HttpStatus.BAD_REQUEST,`Only claims with 'Rejected' status can be reclaimed.`);
    }
    await claimService.updateClaimStatus({
      claimId,
      status: 'Submitted',
      currentUserId,
      currentDate,
    });
    await claimService.addClaimHistory({
      claimId,
      status: 'Submitted',
      currentUserId,
      currentDate,
    });
    await claimService.addClaimRemarks({
      claimId,
      remark,
      user: 'Agent',
      status: 'Submitted',
      currentUserId,
      currentDate,
    });
    return apiResponse.result(res, { claimId }, HttpStatus.OK, 'Claim reclaimed successfully.');
  } catch (error: unknown) {
    const err = commonService.isDBError(error) ? 'Something went wrong while reclaiming the claim' : (error as Error).message;
    logger.error('Error at reclaim ctrl: ', (error as Error).message);
    return apiResponse.error(res,HttpStatus.INTERNAL_SERVER_ERROR,err);
  }
};
export default {
  createClaim,
  getClaimsList,
  updateClaimStatus,
  createRemarkLog,
  getRemarkHistory,
  reclaim
};
