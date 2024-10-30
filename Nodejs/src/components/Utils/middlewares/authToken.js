const { sendError } = require("../CommonUtils.js");
const jwt = require('jsonwebtoken')
const config = require('config');
const jwtSecret = config.get('JWTSECRET');
const client = require("../redisClient.js");

const verifyToken = async (req, res, next) => {
    try {
        let token = req.headers.authorization;

        if (!token) {
            return sendError(req, res, { message: "Access denied. No token provided." }, 403);
        }

        let BearerToken = token.replace("Bearer ", "");

        const decoded = jwt.verify(BearerToken, jwtSecret);

        const inDenyList = await client.sIsMember("blackList", `bl_${BearerToken}`);
        if (inDenyList) {
            return sendError(req, res, { message: "Access denied" }, 403);
        }

        req.user = decoded;
        next();
        
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return sendError(req, res, { message: "Unauthorized! Token expired." }, 401);
        } else {
            return sendError(req, res, { message: "Invalid token." }, 403);
        }
    }
};

module.exports = verifyToken;
