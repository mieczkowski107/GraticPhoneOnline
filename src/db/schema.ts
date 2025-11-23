import { sql } from "drizzle-orm";
import { int, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";


// TODO: https://orm.drizzle.team/docs/zod

// IMPORTRANT: current pwd should be \src\db to run commands below:
// Generate migrations: npx drizzle-kit generate
// Apply migrations: npx drizzle-kit migrate
// Or npx drizzle-kit push which directly apply changes to db

//#region Users and roles
export const usersTable = sqliteTable("users", {
  id: int().primaryKey({ autoIncrement: true }),
  username: text().notNull().unique(),
  email: text().notNull().unique(),
  hashedPassword: text().notNull(),
  createdAt: text().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().default(sql`CURRENT_TIMESTAMP`)
});

export const rolesTable = sqliteTable("roles", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
  createdAt: text().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().default(sql`CURRENT_TIMESTAMP`)
})

export const userRolesTable = sqliteTable("user_roles", {
  userId: int().notNull().references(() => usersTable.id),
  roleId: int().notNull().references(() => rolesTable.id),
  createdAt: text().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text().default(sql`CURRENT_TIMESTAMP`)
}, (table) => [
  primaryKey({ columns: [table.userId, table.roleId] }),
])

export const refreshTokenTable = sqliteTable("refresh_tokens", {
  id: int().primaryKey({ autoIncrement: true }),
  userId: int().notNull().references(() => usersTable.id),
  tokenHash: text().notNull().unique(),
  createdAt: text().default(sql`CURRENT_TIMESTAMP`),
})

export type UserInsert = typeof usersTable.$inferInsert;
export type UserSelect = typeof usersTable.$inferSelect;

export type RoleInsert = typeof rolesTable.$inferInsert;
export type RoleSelect = typeof rolesTable.$inferSelect;

export type userRolesInsert = typeof userRolesTable.$inferInsert;
export type userRolesSelect = typeof userRolesTable.$inferSelect;

export type refreshTokenInsert = typeof refreshTokenTable.$inferInsert;
export type refreshTokenSelect = typeof refreshTokenTable.$inferSelect;

// #endregion




//#region Games

//#endregion


