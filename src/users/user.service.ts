import { db } from "../db/index.ts";
import { UserInsert, userRolesTable, UserSelect, usersTable } from "../db/schema.ts";
import { eq, or } from "drizzle-orm";
import { createdUserDto, UserLoginData, UserRegistrationData } from "./user.model.ts";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import { AuthenticationError, InvalidInputError, NotFoundError } from "../exceptions/errors.ts";

//Maybe need to move it to some auth.service 
//Need to add roles 
export const createUser = async (userData: UserRegistrationData): Promise<createdUserDto> => {
    const existingUsers = await db
        .select()
        .from(usersTable)
        .where(
            or(
                eq(usersTable.email, userData.email),
                eq(usersTable.username, userData.username)
            )
        );

    if (existingUsers.length > 0) {
        const existing = existingUsers[0];
        if (existing.email === userData.email) {
            throw new InvalidInputError("User with this email already exists.");
        }
        if (existing.username === userData.username) {
            throw new InvalidInputError("User with this username already exists.");
        }
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const userToInsert: UserInsert = {
        username: userData.username,
        email: userData.email,
        hashedPassword,
    };

    const createdUser = await db.insert(usersTable).values(userToInsert).returning();

    return {
        username: createdUser[0].username,
        email: createdUser[0].email,
    };
};

export const userLoginProcess = async (userData: UserLoginData) => {
    const user = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, userData.email));
    if (user.length === 0) {
        throw new NotFoundError("User not found");
    }
    const isPasswordValid = await bcrypt.compare(userData.password, user[0].hashedPassword);
    if (!isPasswordValid) {
        throw new AuthenticationError("Invalid password");
    }

    const accessToken = generateAccessToken(userData, 600);
    const refreshToken = jwt.sign({ email: userData.email }, "RefreshToken");
    return { accessToken, refreshToken };
}

export const getAllUsers = async () => {
    return await db.select().from(usersTable);
}

export const getSingleUser = async (userId: number) => {
    return await db.select()
        .from(usersTable)
        .where(eq(usersTable.id, userId));
}

export const updateUser = async (userId: number, user: any) => {
    return await db.update(usersTable).set(user);
}

export const deleteUser = async (userId: number) => {
    const userToDelete = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (userToDelete.length === 0 || userToDelete === undefined) {
        throw new Error("User not found");
    }
    return await db.delete(usersTable).where(eq(usersTable.id, userId));
}

const generateAccessToken = (user: UserLoginData, tokenDurationInSeconds: number) => {
    return jwt.sign({ email: user.email, role: "User" }, "AccessToken", { expiresIn: tokenDurationInSeconds });
}

