import jwt from 'jsonwebtoken'

const requireAuth = (req ,res, next) => {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            message : `Authorization token required`
        })
    }

    const token = authHeader.split(' ')[1]

    try {
        const decoded = jwt.verify(token , process.env.SECRET)
        req.user = decoded
        next()
    } catch (error) {
        res.status(401).json({
            message : "Invalid Token"
        })
    }
}

export default requireAuth