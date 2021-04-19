import { Account } from "../entities/Account";
import { MyContext } from "src/types";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Resolver,
  Int,
} from "type-graphql";
import argon2 from "argon2";
import { createAccessToken, createRefreshToken } from "../auth";
import { sendRefreshToken } from "../sendRefreshToken";

@InputType()
class AccountInput {
  @Field()
  email: string;
  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class AccountResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => Account, { nullable: true })
  account?: Account;

  @Field(() => String, { nullable: true })
  accessToken?: string;
}

@Resolver()
export class AccountResolver {
  //register
  @Mutation(() => AccountResponse)
  async register(
    @Arg("options") options: AccountInput,
    @Ctx() { em }: MyContext
  ): Promise<AccountResponse> {
    if (options.email.length <= 2) {
      return {
        errors: [
          {
            field: "email",
            message: "email length must be greater than 2",
          },
        ],
      };
    }

    if (options.password.length <= 2) {
      return {
        errors: [
          {
            field: "password",
            message: "password length must be greater than 2",
          },
        ],
      };
    }

    const hasedPassword = await argon2.hash(options.password);
    const account = em.create(Account, {
      email: options.email,
      password: hasedPassword,
    });
    try {
      await em.persistAndFlush(account);
    } catch (err) {
      if (err.code === "23505" || err.detail.includes("already exists")) {
        return {
          errors: [
            {
              field: "accountname",
              message: "accountname is already taken",
            },
          ],
        };
      }
    }
    return { account };
  }
  //login
  @Mutation(() => AccountResponse)
  async login(
    @Arg("options") options: AccountInput,
    @Ctx() { em, res }: MyContext
  ): Promise<AccountResponse> {
    //find account
    const account = await em.findOne(Account, {
      email: options.email.toLowerCase(),
    });
    if (!account) {
      return {
        errors: [{ field: "email", message: "that email doesn't exist" }],
      };
    }
    // check password
    const valid = await argon2.verify(account.password, options.password);
    if (!valid) {
      return {
        errors: [{ field: "password", message: "incorrect password" }],
      };
    }

    sendRefreshToken(res, createRefreshToken(account));

    return {
      account,
      accessToken: createAccessToken(account),
    };
  }

  @Mutation(() => Boolean)
  async revokeRefreshTokensForAccount(
    @Arg("accountId", () => Int) accountId: number,
    @Ctx() { em }: MyContext
  ) {
    const account = await em.findOne(Account, {
      id: accountId,
    });
    if (account) {
      account.tokenVersion += 1;
      await em.persistAndFlush(account);
      return true;
    }
    return false;
  }
}
