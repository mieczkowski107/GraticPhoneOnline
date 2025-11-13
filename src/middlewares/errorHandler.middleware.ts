import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { AuthenticationError, InvalidInputError, NotFoundError } from "../exceptions/errors.ts";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof InvalidInputError) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: err.message });
    }

    if (err instanceof AuthenticationError) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ message: err.message });
    }

    if (err instanceof NotFoundError) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: err.message });
    }

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
};
