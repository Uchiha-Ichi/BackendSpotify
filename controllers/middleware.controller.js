const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "You are not authenticated" });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Token missing" }); // Báo lỗi nếu không có token
    }
    jwt.verify(token, process.env.JWT_ACCESS_KEY, (err, account) => {
        if (err) {
            return res.status(403).json({ message: "Token is not valid" });
        }
        req.account = account;
        next();
    });
};
const verifyTokenAndUserAuthorization = (req, res, next) => {
    verifyToken(req, res, (err) => {
        if (err) return next(err);
        const { account } = req;
        if (account.id === req.params.id || account.isAdmin) {
            next();
        } else {
            res.status(403).json({ message: "You're not allowed to do that!" });
        }
    });
};
const verifyTokenAndAdmin = (req, res, next) => {
    verifyToken(req, res, (err) => {
        if (err) return next(err);
        const { account } = req;
        if (account.isAdmin) {
            next();
        } else {
            res.status(403).json({ message: "You're not allowed to do that!" });
        }
    });
};

module.exports = {
    verifyToken,
    verifyTokenAndUserAuthorization,
    verifyTokenAndAdmin,
};
