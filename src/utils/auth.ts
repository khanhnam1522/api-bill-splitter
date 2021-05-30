import { sign } from "jsonwebtoken";
import { UserProfile } from "../entities/UserProfile";

export const createAccessToken = (user: UserProfile) => {
  return sign({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET!);
};

//? Not using this for now
// export const createRefreshToken = (user: UserProfile) => {
//   return sign(
//     { userId: user.id },
//     process.env.REFRESH_TOKEN_SECRET!
//   );
// };
