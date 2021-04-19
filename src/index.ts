import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import microConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { BillResolver } from "./resolvers/bill";
import { AccountResolver } from "./resolvers/account";
import cookieParser from "cookie-parser";
import { verify } from "jsonwebtoken";
import { Account } from "./entities/Account";
import { createAccessToken, createRefreshToken } from "./auth";
import { sendRefreshToken } from "./sendRefreshToken";

const main = async () => {
  const orm = await MikroORM.init(microConfig);
  await orm.getMigrator().up();

  const app = express();
  app.use(cookieParser());
  app.post("/refresh_token", async (req, res) => {
    const token = req.cookies.jid;
    if (!token) {
      return res.send({ ok: false, accessToken: "" });
    }
    //Check token validation
    let payload: any = null;
    try {
      payload = verify(token, process.env.REFRESH_TOKEN_SECRET!);
    } catch (err) {
      console.log(err);
      return res.send({ ok: false, accessToken: "" });
    }

    //token is valid and we can send back an access
    const account = await orm.em.findOne(Account, { id: payload.accountId });

    if (!account) {
      return res.send({ ok: false, accessToken: "" });
    }

    if (account.tokenVersion !== payload.tokenVersion) {
      return res.send({ ok: false, accessToken: "" });
    }

    sendRefreshToken(res, createRefreshToken(account));

    return res.send({ ok: true, accessToken: createAccessToken(account) });
  });

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [BillResolver, AccountResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({
      em: orm.em,
      req,
      res,
    }),
  });

  apolloServer.applyMiddleware({ app });

  app.listen(4000, () => {
    console.log("SERVER STARTED ON LOCALHOST:4000");
  });
};

main().catch((error) => {
  console.error(error);
});
