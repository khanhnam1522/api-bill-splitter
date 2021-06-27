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
import { timeDifferenceInMinute } from "../utils/time";

const VERIFICATION_CODE_EXPIRE_TIME = 30;

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

@InputType()
class VerifyCodeInput {
  @Field()
  verificationCode: number;
  @Field()
  email: string;
}

@InputType()
class ChangePasswordInput {
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
  @Field(() => FieldError, { nullable: true })
  errors?: FieldError;

  @Field(() => UserProfile, { nullable: true })
  user?: UserProfile;

  @Field(() => String, { nullable: true })
  accessToken?: string;
}

@ObjectType()
class VerifyCodeResponse {
  @Field(() => FieldError, { nullable: true })
  errors?: FieldError;
  @Field()
  validateSucess?: Boolean;
}

@ObjectType()
class ChangePasswordResponse {
  @Field(() => FieldError, { nullable: true })
  errors?: FieldError;
  @Field()
  changePasswordSuccess?: Boolean;
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
    return { 
      user,       
      accessToken: createAccessToken(user),
    };
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
    //generate random code and update the table
    const verificationCode = Math.floor(10000000 + Math.random() * 90000000);
    await UserProfile.update(
      { id: user.id },
      { verificationCode, verificationCodeUpdatedAt: new Date() }
    );
    //send email
    await sendEmail(
      data.email,
      `<div><h2>Your verification code</h2> <h5>${verificationCode}</h5></div>`
    );
    return true;
  }

  //verify code
  @Mutation(() => VerifyCodeResponse)
  async verifyCode(
    @Arg("data") data: VerifyCodeInput
  ): Promise<VerifyCodeResponse> {
    const user = await UserProfile.findOne({ where: { email: data.email } });
    //Check if user exist
    if (!user) {
      return {
        errors: {
          field: "email",
          message: "Invalid verification code",
        },
        validateSucess: false,
      };
    }
    //Check if verification code match
    if (user.verificationCode !== data?.verificationCode) {
      return {
        errors: {
          field: "verificationCode",
          message: "Invalid verification code",
        },
        validateSucess: false,
      };
    }
    //Check if verification code expired
    const timeDiffInMinutes = timeDifferenceInMinute(
      user.verificationCodeUpdatedAt,
      new Date()
    );
    if (timeDiffInMinutes >= VERIFICATION_CODE_EXPIRE_TIME) {
      return {
        errors: {
          field: "verificationCode",
          message: "Verification code expired",
        },
        validateSucess: false,
      };
    }
    return {
      validateSucess: true,
    };
  }

  @Mutation(() => ChangePasswordResponse)
  async changePassword(
    @Arg("data") data: ChangePasswordInput
  ): Promise<ChangePasswordResponse> {
    const user = await UserProfile.findOne({ where: { email: data.email } });
    //Check if user exist
    if (!user) {
      return {
        errors: {
          field: "email",
          message: "Something went wrong. Please try again later",
        },
        changePasswordSuccess: false,
      };
    }
    const hashedPassword = await argon2.hash(data.password);
    await UserProfile.update({ id: user.id }, { password: hashedPassword });
    return {
      changePasswordSuccess: true,
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
