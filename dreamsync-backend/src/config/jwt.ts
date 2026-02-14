const secret = process.env.JWT_SECRET?.trim();
if (!secret) {
  throw new Error("JWT_SECRET not configured");
}

export const JWT_CONFIG = {
  secret,
  expiresIn: "7d",
};
  
