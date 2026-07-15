import jwt from 'jsonwebtoken'
import users from '../models/users.js';

const requireAuth = async (req ,res, next) => {

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({
            message : `Authorization token required`
        })
    }
    const token = authHeader.split(' ')[1]
    try {
        const decoded = jwt.verify(token , process.env.SECRET)
        const user = await users.findById(decoded.id)
        if (!user) {
            return res.status(401).json({
                message : "User not found"
            })
        }
        if (decoded.tokenVersion !== user.tokenVersion) {
            return res.status(401).json({
                message : "Session Expired. Please Login again"
            })
        }
        req.user = decoded
        next()
    } catch (error) {
        res.status(401).json({
            message : "Invalid Token"
        })
    }
}

export default requireAuth