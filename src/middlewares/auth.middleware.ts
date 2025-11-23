import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

export interface AuthenticatedRequest extends Request {
    user?: JwtPayload;
}

export const authenticateJwtToken = (req: AuthenticatedRequest, res: Response, next: NextFunction
) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];

    if (!token) {
        return res.sendStatus(StatusCodes.UNAUTHORIZED);
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, (err, user) => {
        if (err) {
            return res.sendStatus(StatusCodes.FORBIDDEN);
        }

        req.user = user as JwtPayload;
        next();
    });
};

export const authorizeRole = (roles: string[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.sendStatus(StatusCodes.UNAUTHORIZED);
        }

        if (!roles.includes(req.user.role)) {
            return res.sendStatus(StatusCodes.FORBIDDEN);
        }

        next();
    };
};
