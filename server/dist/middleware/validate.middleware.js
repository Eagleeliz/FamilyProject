"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const express_validator_1 = require("express-validator");
const errors_js_1 = require("../utils/errors.js");
const validate = (validations) => {
    return async (req, _res, next) => {
        await Promise.all(validations.map((validation) => validation.run(req)));
        const errors = (0, express_validator_1.validationResult)(req);
        if (errors.isEmpty()) {
            return next();
        }
        const errorMessages = errors.array().map((e) => e.msg).join(', ');
        next(new errors_js_1.BadRequestError(errorMessages));
    };
};
exports.validate = validate;
//# sourceMappingURL=validate.middleware.js.map