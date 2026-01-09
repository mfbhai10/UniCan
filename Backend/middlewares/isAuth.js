import jwt from 'jsonwebtoken';
const isAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        // Verify token logic here (e.g., using JWT)
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(!decoded){
            return res.status(401).json({ message: "Token not valid" });
        }
        
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(500).json({ message: "isAuth middleware error" });
    }
};

export default isAuth;