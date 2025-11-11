import { drizzle } from "drizzle-orm/libsql";
import * as schema from './schema.ts';
import { createClient } from "@libsql/client";
import { RoleInsert, RoleSelect, rolesTable } from "./schema.ts";

const client = createClient({
    url: "file:./graticPhoneDb.db",
});
export const db = drizzle({ client, schema });

//Seeding
export const SeedRoles = async (roles?: string[]) => {
    if (!roles) roles = ["Admin", "User"];

    const rolesFromDb: RoleSelect[] = await db.select().from(rolesTable);
    const existingRoleNames = rolesFromDb.map(r => r.name);

    const rolesToAdd = roles
        .filter(role => !existingRoleNames.includes(role))
        .map(role => ({ name: role } as RoleInsert));

    if (rolesToAdd.length > 0) {
        await db.insert(rolesTable).values(rolesToAdd);
    }
};


export const SeedAdminAccount = async () => {

}