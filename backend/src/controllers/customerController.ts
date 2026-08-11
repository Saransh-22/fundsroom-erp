import { Request, Response, NextFunction } from 'express';
import * as customerService from '../services/customerService';

export const getCustomers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const search = req.query.search as string | undefined;
    const type = req.query.type as string | undefined;
    const status = req.query.status as string | undefined;
    const page = parseInt(String(req.query.page || '1'), 10);
    const limit = parseInt(String(req.query.limit || '10'), 10);

    const result = await customerService.getCustomers(search, type, status, page, limit);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getCustomerById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const customer = await customerService.getCustomerById(id);
    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

export const createCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const customer = await customerService.createCustomer(req.body);
    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const customer = await customerService.updateCustomer(id, req.body);
    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

export const getCustomerNotes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const notes = await customerService.getCustomerNotes(id);
    res.status(200).json({ success: true, data: notes });
  } catch (error) {
    next(error);
  }
};

export const addCustomerNote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const { note } = req.body;
    const userId = req.user!.id;
    const newNote = await customerService.addCustomerNote(id, note, userId);
    res.status(201).json({ success: true, data: newNote });
  } catch (error) {
    next(error);
  }
};
