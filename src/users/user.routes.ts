import { Router } from "express";
import { registerUser, deleteUser, getUserById, getUsers, loginUser, updateUser } from "./user.controller.ts";
import { validateRequestBody } from "../middlewares/requestValidation.middleware.ts";
import { userLoginSchema, userRegistrationSchema } from "./user.model.ts";

const userRouter = Router();

//Maybe move to auth router
userRouter.post('/register', validateRequestBody(userRegistrationSchema), registerUser);
userRouter.post('/login', validateRequestBody(userLoginSchema), loginUser);

userRouter.get('/', getUsers);
userRouter.get('/:id', getUserById);
userRouter.put('/:id', updateUser);
userRouter.delete('/:id', deleteUser);

export default userRouter;


