import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({
                error: "No authentication token found",
            });
        }
        jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
            if (err) {
                if (err.name === "TokenExpiredError") {
                    return res.status(401).json({
                        error: "Token has expired",
                    });
                }
                return res.status(401).json({
                    error: "Invalid token",
                });
            }
            req.userId = decoded.id;
            next();
        });
    } catch (error) {
        console.error("Auth middleware error:", error.message);
        return res.status(500).json({
            error: "Internal server error",
        });
    }
};
