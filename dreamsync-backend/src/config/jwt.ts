export const JWT_CONFIG = {
    secret: process.env.JWT_SECRET || "dev-secret-change-me",
    expiresIn: "7d",
  };
  