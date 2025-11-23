import { db } from "../db/index.ts";
import { refreshTokenInsert, refreshTokenTable, RoleInsert, rolesTable, UserInsert, userRolesInsert, userRolesTable, UserSelect, usersTable } from "../db/schema.ts";
import { eq, inArray, or, sql } from "drizzle-orm";
import { createdUserDto, UserLoginData, UserRegistrationData } from "./user.model.ts";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import { AuthenticationError, InvalidInputError, NotFoundError } from "../exceptions/errors.ts";
import { accessSync } from "fs";

const tempAccessTokenSecret = "AccessToken";
const tempRefreshTokenSecret = "RefreshToken";

//Maybe need to move it to some auth.service 
export const createUser = async (userData: UserRegistrationData, roles?: string[]): Promise<createdUserDto> => {
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
    const assignedRoles = roles?.length ? roles : ["User"];


    const hashedPassword = await generateHashedString(userData.password);

    const userToInsert: UserInsert = {
        username: userData.username,
        email: userData.email,
        hashedPassword,
    };

    const dto = await db.transaction(async (tx) => {
        const createdUser = await tx.insert(usersTable).values(userToInsert).returning();
        const rolesToAdd = await tx.select().from(rolesTable).where(inArray(rolesTable.name, assignedRoles as string[]));
        const userRolesToAdd: userRolesInsert[] = rolesToAdd.map(role => {
            return { userId: createdUser[0].id, roleId: role.id }
        })
        const insertedUserRoles = await tx.insert(userRolesTable).values(userRolesToAdd).returning();
        const rolesNames = await tx.select({ role: rolesTable.name }).from(rolesTable).where(inArray(rolesTable.id, insertedUserRoles.map(i => i.roleId)))
        return {
            username: createdUser[0].username,
            email: createdUser[0].email,
            roles: rolesNames.map(r => r.role)
        }
    });
    return dto;
};

export const userLoginProcess = async (userData: UserLoginData) => {
    const user: UserSelect[] = await db
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

    const accessToken = await generateAccessToken(user[0], 600000); // need to change it later by adding refresh token endpoint
    const refreshToken = jwt.sign({ email: user[0].email }, "RefreshToken");
    return { accessToken, refreshToken };
}

export const userLogout = async (userId: number) => {
    await db.delete(refreshTokenTable).where(eq(refreshTokenTable.userId, userId));
    //Remember to delete jwt refresh and access token on a client side
    //Maybe need to add some blacklist for expired jwt if they are not expired
}

export const refreshAccessToken = async (accessToken: string, clientRefreshToken: string) => {
    let user: tokenUserData;

    try {
        user = jwt.verify(accessToken, tempAccessTokenSecret, { ignoreExpiration: true }) as tokenUserData;
    } catch {
        throw new AuthenticationError("Invalid token.");
    }
    const userFromDb = await db.select().from(usersTable)
        .where(eq(usersTable.email, user.email)).get();

    if (!userFromDb) throw new NotFoundError("User not found");

    const refreshToken = await db.select().from(refreshTokenTable)
        .where(eq(refreshTokenTable.userId, userFromDb?.id!)).get();

    if (!refreshToken) throw new AuthenticationError("Invalid token.");

    const isRefreshTokenValid = await bcrypt.compare(clientRefreshToken, refreshToken?.tokenHash!);
    if (!isRefreshTokenValid) throw new AuthenticationError("Invalid token.");

    return await generateAccessToken(userFromDb, 600000);
};


export const getAllUsers = async () => {
    const users = await db.select().from(usersTable);
    return users;
}

export const getSingleUser = async (userId: number) => {
    const [user] = await db.select()
        .from(usersTable)
        .where(eq(usersTable.id, userId));
    return user !== undefined ? user : undefined;
}

export const updateUser = async (userId: number, user: any): Promise<void> => {
    const updatedUser = await db.update(usersTable).set(user).where(eq(usersTable.id, userId)).returning();
}

export const deleteUser = async (userId: number): Promise<void> => {
    const userToDelete = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (userToDelete.length === 0) {
        throw new NotFoundError("User not found");
    }
    await db.delete(usersTable).where(eq(usersTable.id, userId));
}

//Maybe need to move to HashHelper.ts or sth
export const generateRefreshToken = async (userData: UserSelect) => {
    const userRefreshToken = await db.query.refreshTokenTable.findFirst({
        where: eq(refreshTokenTable.userId, userData.id)
    });
    if (userRefreshToken !== undefined) {
        return;
    }
    const refreshToken = jwt.sign({ email: userData.email }, tempRefreshTokenSecret);
    const tokenToInsert: refreshTokenInsert = {
        userId: userData.id,
        tokenHash: await generateHashedString(refreshToken),
    }
    await db.insert(refreshTokenTable).values(tokenToInsert);
    return refreshToken;
}


const generateAccessToken = async (user: UserSelect, tokenDurationInSeconds: number): Promise<string> => {
    const userRolesQuery = await db.select().from(userRolesTable).innerJoin(rolesTable, eq(userRolesTable.roleId, rolesTable.id)).where(eq(userRolesTable.userId, user.id));
    const roles = userRolesQuery.map(i => i.roles.name);
    return jwt.sign({ email: user.email, role: roles }, "AccessToken", { expiresIn: tokenDurationInSeconds });
}

const generateHashedString = async (value: string, saltRounds: number = 10) => {
    const salt = await bcrypt.genSalt(saltRounds);
    const hashed = await bcrypt.hash(value, salt);
    return hashed;
}

type tokenUserData = {
    email: string,
    role: string[],
}