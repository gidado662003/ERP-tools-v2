const jwt = require("jsonwebtoken");

function adminAuth(req, res, next) {
    const token = req.cookies.admin_token;

    if (!token) {
        return res.status(401).json({ message: "No admin token, authorization denied" });
    }

    try {
        const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
        if (!decoded.isAdmin) {
            return res.status(403).json({ message: "Not authorized as admin" });
        }
        req.isAdmin = true;
        next();
    } catch (error) {
        res.status(401).json({ message: "Admin token is not valid" });
    }
}

module.exports = adminAuth;