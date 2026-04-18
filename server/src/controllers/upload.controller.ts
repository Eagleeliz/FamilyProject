import { Request, Response, NextFunction } from 'express';
import { cloudinary } from '../config/cloudinary.js';
import { ApiResponse } from '../types/index.js';

export class UploadController {
  async uploadImage(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: 'No file uploaded',
        });
        return;
      }

      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;

      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'lineage/profiles',
        width: 400,
        height: 400,
        crop: 'fill',
        gravity: 'face',
      });

      const response: ApiResponse<{ url: string }> = {
        success: true,
        data: { url: result.secure_url },
        message: 'Image uploaded successfully',
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const uploadController = new UploadController();
