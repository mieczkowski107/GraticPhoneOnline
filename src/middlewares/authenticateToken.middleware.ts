import { NextFunction, Request, Response } from "express"
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken"
export const authenticateJwtToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];
    if (token === undefined) {
        return res.send(StatusCodes.UNAUTHORIZED);
    }
    jwt.verify(token, "AccessToken", (err, user) => {
        if (err) { return res.send(StatusCodes.FORBIDDEN) }
        req.body = user;
        next();
    })
}