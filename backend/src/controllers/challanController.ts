import { Request, Response, NextFunction } from 'express';
import * as challanService from '../services/challanService';

export const createChallan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { customer_id, items, status } = req.body;
    const createdBy = req.user!.id;

    const challan = await challanService.createChallan(customer_id, items, status, createdBy);
    res.status(201).json({ success: true, data: challan });
  } catch (error) {
    next(error);
  }
};

export const getChallans = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const search = req.query.search as string | undefined;
    const status = req.query.status as string | undefined;
    const page = parseInt(String(req.query.page || '1'), 10);
    const limit = parseInt(String(req.query.limit || '10'), 10);

    const result = await challanService.getChallans(search, status, page, limit);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getChallanById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const challan = await challanService.getChallanById(id);
    res.status(200).json({ success: true, data: challan });
  } catch (error) {
    next(error);
  }
};

export const confirmChallan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const userId = req.user!.id;

    const challan = await challanService.confirmChallan(id, userId);
    res.status(200).json({ success: true, data: challan });
  } catch (error) {
    next(error);
  }
};
