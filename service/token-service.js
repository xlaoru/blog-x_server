const jwt = require('jsonwebtoken');
// const Token = require('../models/token');

const accessTokenSecret = process.env.JWT_ACCESS_SECRET;
const refreshTokenSecret = process.env.JWT_REFRESH_SECRET;

exports.generateTokens = async (payload) => {
    const accessToken = jwt.sign(payload, accessTokenSecret, { expiresIn: '1m' });
    const refreshToken = jwt.sign(payload, refreshTokenSecret, { expiresIn: '1w' });
    return { accessToken, refreshToken };
}

exports.validateAccessToken = async (token) => {
    try {
        const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        return userData;
    } catch (error) {
        return null
    }
}

exports.validateRefreshToken = async (token) => {
    try {
        const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        return userData;
    } catch (error) {
        return null
    }
}