import { FastifyRequest, FastifyReply } from "fastify";
import { verifyToken } from "./auth.jwt";

export async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    reply.status(401).send({ message: "Missing Authorization header" });
    return;
  }

  const [type, token] = authHeader.split(" ");

  if (type !== "Bearer" || !token) {
    reply.status(401).send({ message: "Invalid Authorization format" });
    return;
  }

  try {
    const payload = verifyToken(token);
    (request as any).user = payload;
  } catch {
    reply.status(401).send({ message: "Invalid or expired token" });
    return;
  }
}
