import "reflect-metadata";
require("dotenv").config();
import { __prod__ } from "./utils/constants";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { BillResolver } from "./resolvers/bill";
import { UserProfileResolver } from "./resolvers/userprofile";
import cookieParser from "cookie-parser";
import path from "path";
import { createConnection } from 'typeorm'
import { Bill } from "./entities/Bill";
import { UserProfile } from "./entities/UserProfile";

const main = async () => {
  const conn = await createConnection({
    type: 'postgres',
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    migrations: [path.join(__dirname, "./migrations/*")],
    logging: true,
    synchronize: true,
    entities: [Bill, UserProfile],
    ssl: {
      rejectUnauthorized: false,
      ca: process.env.DB_CA_CERTIFICATE
    }
  })

  //? Uncomment to do migrations
  // await conn.runMigrations();

  const app = express();
  app.use(cookieParser());


  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [BillResolver, UserProfileResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({
      req,
      res,
    }),
  });

  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(4000, () => {
    console.log("SERVER STARTED ON LOCALHOST:4000");
  });
};

main().catch((error) => {
  console.error(error);
});
