import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const isProd = process.env.NODE_ENV === "production";
const connectionString = (isProd ? process.env.DATABASE_URL_PROD : process.env.DATABASE_URL_DEV) as string;

const adapter = new PrismaPg({ connectionString });

const prisma = new PrismaClient({ adapter });

export default prisma;
