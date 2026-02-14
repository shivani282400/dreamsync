import { FastifyRequest, FastifyReply } from "fastify";
import { registerUser, loginUser } from "./auth.service.js"
import { signToken } from "./auth.jwt.js"

type RegisterBody = {
  email: string;
  password: string;
};

type LoginBody = {
  email: string;
  password: string;
};

// REGISTER
export async function registerController(
  request: FastifyRequest<{ Body: RegisterBody }>,
  reply: FastifyReply
) {
  const { email, password } = request.body;

  if (!email || !password) {
    return reply.status(400).send({ message: "Missing fields" });
  }

  try {
    const result = await registerUser(request.server.prisma, {
      email,
      password,
    });

    return reply.send({
      id: result.userId,
      username: result.username,
    });
  } catch (err) {
    request.log.error(
      { error: err instanceof Error ? err.message : String(err) },
      "Registration failed"
    );
    const message =
      err instanceof Error ? err.message : "Registration failed";
    return reply.status(400).send({ message });
  }
}

// LOGIN — returns JWT so client can use it as Bearer token
export async function loginController(
  request: FastifyRequest<{ Body: LoginBody }>,
  reply: FastifyReply
) {
  const { email, password } = request.body;

  if (!email || !password) {
    return reply.status(400).send({ message: "Missing fields" });
  }

  try {
    const result = await loginUser(request.server.prisma, {
      email,
      password,
    });

    const token = signToken({
      id: result.userId,
      username: result.username,
    });
    
    
    

    return reply.send({
      token,
      user: {
        id: result.userId,
        username: result.username,
      },
    });
  } catch (err) {
    request.log.error(
      { error: err instanceof Error ? err.message : String(err) },
      "Login failed"
    );
    const message =
      err instanceof Error ? err.message : "Invalid credentials";
    return reply.status(401).send({ message });
  }
}
