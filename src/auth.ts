import { sign } from "jsonwebtoken";
import { Account } from "./entities/Account";

export const createAccessToken = (account: Account) => {
  return sign({ accountId: account.id }, process.env.ACCESS_TOKEN_SECRET!);
};

export const createRefreshToken = (account: Account) => {
  return sign(
    { accountId: account.id, tokenVersion: account.tokenVersion },
    process.env.REFRESH_TOKEN_SECRET!
  );
};
