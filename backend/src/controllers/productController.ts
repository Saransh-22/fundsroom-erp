import { Request, Response, NextFunction } from 'express';
import * as productService from '../services/productService';

export const getProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const search = req.query.search as string | undefined;
    const category = req.query.category as string | undefined;
    const lowStockOnly = req.query.lowStock === 'true';
    const page = parseInt(String(req.query.page || '1'), 10);
    const limit = parseInt(String(req.query.limit || '10'), 10);

    const result = await productService.getProducts(search, category, lowStockOnly, page, limit);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const product = await productService.getProductById(id);
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const product = await productService.updateProduct(id, req.body);
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const getInventoryList = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const search = req.query.search as string | undefined;
    const category = req.query.category as string | undefined;
    const lowStockOnly = req.query.lowStock === 'true';
    const page = parseInt(String(req.query.page || '1'), 10);
    const limit = parseInt(String(req.query.limit || '10'), 10);

    const result = await productService.getProducts(search, category, lowStockOnly, page, limit);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getProductInventoryDetail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const productId = parseInt(String(req.params.productId), 10);
    const product = await productService.getProductById(productId);
    const movements = await productService.getStockMovements(productId);
    res.status(200).json({
      success: true,
      data: {
        product,
        movements,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getStockMovements = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const productId = req.params.productId ? parseInt(String(req.params.productId), 10) : undefined;
    const movements = await productService.getStockMovements(productId);
    res.status(200).json({ success: true, data: movements });
  } catch (error) {
    next(error);
  }
};

export const adjustStock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const productId = parseInt(String(req.params.productId), 10);
    const { quantity_changed, movement_type, reason } = req.body;
    const createdBy = req.user!.id;

    const result = await productService.adjustStock(productId, quantity_changed, movement_type, reason, createdBy);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
