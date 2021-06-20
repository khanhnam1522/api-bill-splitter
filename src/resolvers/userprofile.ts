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
import { createAccessToken } from "../utils/auth";
import { sendEmail } from "../utils/sendEmail";

@InputType()
class UserProfileInput {
  @Field()
  email: string;
  @Field()
  password: string;
  @Field(() => String, { nullable: true })
  username: string;
}

@InputType()
class SendEmailVerificationInput {
  @Field()
  email: string;
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
  @Field(() => FieldError, { nullable: true })
  errors?: FieldError;

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
    @Arg("data") data: UserProfileInput
  ): Promise<UserProfileResponse> {
    const hashedPassword = await argon2.hash(data.password);
    let user;
    try {
      const result = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(UserProfile)
        .values({
          email: data.email,
          password: hashedPassword,
          username: data.username,
        })
        .returning("*")
        .execute();
      user = result.raw[0];
    } catch (err) {
      if (err.code === "23505") {
        return {
          errors: {
            field: "email",
            message: "email is already taken",
          },
        };
      }
    }
    return { user };
  }

  //login
  @Mutation(() => UserProfileResponse)
  async login(
    @Arg("data") data: UserProfileInput
  ): Promise<UserProfileResponse> {
    //find user
    const user = await UserProfile.findOne({ where: { email: data.email } });
    if (!user) {
      return {
        errors: { field: "email", message: "that email doesn't exist" },
      };
    }
    // check password
    const valid = await argon2.verify(user.password, data.password);
    if (!valid) {
      return {
        errors: { field: "password", message: "incorrect password" },
      };
    }
    return {
      user,
      accessToken: createAccessToken(user),
    };
  }

  //send verification code through email
  @Mutation(() => Boolean)
  async sendVerificationCode(
    @Arg("data") data: SendEmailVerificationInput
  ): Promise<Boolean> {
    const user = await UserProfile.findOne({ where: { email: data.email } });
    if (!user) {
      //email is not in the db
      return true;
    }

    await sendEmail(data.email, "<h2>HELLO THERE</h2>");

    return true;
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
