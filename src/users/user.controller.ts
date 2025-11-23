
import { NextFunction, Request, Response } from "express";
import { createUser, getAllUsers, getSingleUser, userLoginProcess, } from "./user.service.ts";
import { UserLoginData, UserRegistrationData } from "./user.model.ts";
import { StatusCodes } from "http-status-codes";

//Maybe need to move to auth.controller
//Need to add roles 
export const registerUser = async (req: Request<{}, {}, UserRegistrationData>, res: Response, next: NextFunction) => {
    try {
        const user = req.body;
        const newUser = await createUser(req.body);
        res.status(StatusCodes.CREATED).json(newUser);
    } catch (error) {
        next(error)
    }
}

export const loginUser = async (req: Request<{}, {}, UserLoginData>, res: Response, next: NextFunction) => {
    try {
        const jwtToken = await userLoginProcess(req.body);
        res.status(StatusCodes.OK).json(jwtToken);
    } catch (error) {
        next(error);
    }
}

export const token = async (req: Request, res: Response) => {

}

export const logoutUser = async (req: Request, response: Response) => {
    
}

export const getUsers = async (_req: Request, res: Response) => {
    const users = await getAllUsers();
    res.status(StatusCodes.CREATED).json(users);
}

export const getUserById = async (req: Request, res: Response) => {
    const userId = +req.params.id;
    const user = await getSingleUser(userId);
    res.send(`get user byId: ${userId}`);
}

export const updateUser = (req: Request, res: Response) => {
    const userId = req.params.id;
    const requestBody = req.body;
    res.send(`Update User`);
}

export const deleteUser = async (req: Request, res: Response) => {
    const userId = req.params.id;
    res.send(`Delete User`);
}

