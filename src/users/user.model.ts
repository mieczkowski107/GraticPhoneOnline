import * as z from "zod"

export const userRegistrationSchema = z.object({
    username: z.string()
        .trim()
        .min(3, "Username too short")
        .max(20, "Username too long")
        .transform(v => v.toUpperCase()),
    email: z.string()
        .trim()
        .transform(v => v.toLowerCase()), // Need to add email validation
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .max(128, "Password too long")
})


export const userLoginSchema = z.object({
    email: z.string()
        .trim()
        .transform(v => v.toLowerCase()),  // Need to add email validation
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .max(128, "Password too long")
})


export type UserRegistrationData = z.infer<typeof userRegistrationSchema>;
export type UserLoginData = z.infer<typeof userLoginSchema>;

export type createdUserDto = {
    username: string,
    email: string,
    roles: string[]
}