"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadController = exports.UploadController = void 0;
const cloudinary_js_1 = require("../config/cloudinary.js");
class UploadController {
    async uploadImage(req, res, next) {
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
            const result = await cloudinary_js_1.cloudinary.uploader.upload(dataURI, {
                folder: 'lineage/profiles',
                width: 400,
                height: 400,
                crop: 'fill',
                gravity: 'face',
            });
            const response = {
                success: true,
                data: { url: result.secure_url },
                message: 'Image uploaded successfully',
            };
            res.json(response);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.UploadController = UploadController;
exports.uploadController = new UploadController();
//# sourceMappingURL=upload.controller.js.map