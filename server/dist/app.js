"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const index_js_1 = require("./config/index.js");
const errors_js_1 = require("./utils/errors.js");
const auth_routes_js_1 = __importDefault(require("./routes/auth.routes.js"));
const family_routes_js_1 = __importDefault(require("./routes/family.routes.js"));
const person_routes_js_1 = __importDefault(require("./routes/person.routes.js"));
const relationship_routes_js_1 = __importDefault(require("./routes/relationship.routes.js"));
const admin_routes_js_1 = __importDefault(require("./routes/admin.routes.js"));
const upload_routes_js_1 = __importDefault(require("./routes/upload.routes.js"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.get('/api/health', (_req, res) => {
    res.json({ success: true, message: 'Lineage API is running', timestamp: new Date().toISOString() });
});
app.use('/api/auth', auth_routes_js_1.default);
app.use('/api/families', family_routes_js_1.default);
app.use('/api/persons', person_routes_js_1.default);
app.use('/api/relationships', relationship_routes_js_1.default);
app.use('/api/admin', admin_routes_js_1.default);
app.use('/api/upload', upload_routes_js_1.default);
app.use((_req, res) => {
    res.status(404).json({ success: false, error: 'Route not found' });
});
app.use((err, _req, res, _next) => {
    console.error('Error:', err);
    if (err instanceof errors_js_1.AppError) {
        return res.status(err.statusCode).json({
            success: false,
            error: err.message,
        });
    }
    res.status(500).json({
        success: false,
        error: index_js_1.config.nodeEnv === 'development' ? err.message : 'Internal server error',
    });
});
const PORT = index_js_1.config.port;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${index_js_1.config.nodeEnv}`);
});
exports.default = app;
//# sourceMappingURL=app.js.map