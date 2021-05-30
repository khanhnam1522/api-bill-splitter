import { UserProfile } from "../entities/UserProfile";
import {
  Arg,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Resolver,
} from "type-graphql";
import argon2 from "argon2";
import { getConnection } from "typeorm";
import { createAccessToken } from "../utils/auth"

@InputType()
class UserProfileInput {
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
class UserProfileResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => UserProfile, { nullable: true })
  user?: UserProfile;

  @Field(() => String, { nullable: true })
  accessToken?: string;
}

@Resolver()
export class UserProfileResolver {
  //register
  @Mutation(() => UserProfileResponse)
  async register(
    @Arg("options") options: UserProfileInput,
  ): Promise<UserProfileResponse> {
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

    const hashedPassword = await argon2.hash(options.password);
    let user;
    try {
      const result = await getConnection()
      .createQueryBuilder()
      .insert()
      .into(UserProfile)
      .values({
        email: options.email,
        password: hashedPassword,
      })
      .returning("*")
      .execute();
    user = result.raw[0];    
  } catch (err) {
      if (err.code === "23505") {
        return {
          errors: [
            {
              field: "username",
              message: "username is already taken",
            },
          ],
        };
      }
    }
    return { user };
  }

  //login
  @Mutation(() => UserProfileResponse)
  async login(
    @Arg("options") options: UserProfileInput,
  ): Promise<UserProfileResponse> {
    //find user
    const user = await UserProfile.findOne({where: { email: options.email }});
    if (!user) {
      return {
        errors: [{ field: "email", message: "that email doesn't exist" }],
      };
    }
    // check password
    const valid = await argon2.verify(user.password, options.password);
    if (!valid) {
      return {
        errors: [{ field: "password", message: "incorrect password" }],
      };
    }
    return {
      user,
      accessToken: createAccessToken(user),
    };
  }

  //? Not using this for now
  // @Mutation(() => Boolean)
  // async revokeRefreshTokensForUserProfile(
  //   @Arg("userId", () => Int) userId: number,
  // ) {
  //   const user = await em.findOne(UserProfile, {
  //     id: userId,
  //   });
  //   if (user) {
  //     user.tokenVersion += 1;
  //     await em.persistAndFlush(user);
  //     return true;
  //   }
  //   return false;
  // }
}
