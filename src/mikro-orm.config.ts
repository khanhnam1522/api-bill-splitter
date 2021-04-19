import { __prod__ } from "./constants";
import { Bill } from "./entities/Bill";
import { MikroORM } from "@mikro-orm/core";
import path from "path";
import { Account } from "./entities/Account";

require("dotenv").config();
export default {
  migrations: {
    path: path.join(__dirname, "./migrations"), // path to the folder with migrations
    pattern: /^[\w-]+\d+\.[tj]s$/, // regex pattern for the migration files
  },
  entities: [Bill, Account],
  dbName: process.env.DB_NAME,
  type: "postgresql",
  password: process.env.DB_PASSWORD,
  debug: !__prod__,
} as Parameters<typeof MikroORM.init>[0];
