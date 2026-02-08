import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";
import { JWT_CONFIG } from "../../config/jwt";

const JWT_SECRET: Secret = JWT_CONFIG.secret;

const SIGN_OPTIONS: SignOptions = {
  expiresIn: JWT_CONFIG.expiresIn as SignOptions["expiresIn"],
};

export type AppJwtPayload = {
  id: string;
  username: string;
};

export function signToken(payload: AppJwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, SIGN_OPTIONS);
}

export function verifyToken(token: string): AppJwtPayload {
  const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

  if (!decoded || typeof decoded !== "object") {
    throw new Error("Invalid token");
  }

  const id =
    typeof decoded.id === "string"
      ? decoded.id
      : typeof (decoded as any).userId === "string"
        ? (decoded as any).userId
        : null;
  const username =
    typeof decoded.username === "string"
      ? decoded.username
      : "Anonymous Dreamer";

  if (!id) {
    throw new Error("Invalid token");
  }

  return { id, username };
}
