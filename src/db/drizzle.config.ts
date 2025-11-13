import dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit';

dotenv.config()

export default defineConfig({
    schema: 'schema.ts',
    out: './migrations',
    dialect: 'sqlite',
    dbCredentials: {
        url: "../../graticPhoneDb.db",
    },
    verbose: true,
    strict: true
});