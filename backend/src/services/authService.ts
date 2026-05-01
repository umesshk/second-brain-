import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/env";
import { HttpError } from "../utils/httpError";
import { publicUser } from "../utils/serialize";

const SALT_ROUNDS = 12;

export async function signupUser(input: { name: string; email: string; password: string }) {
  const emailNorm = input.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: emailNorm } });
  if (existing) {
    throw new HttpError(409, "User already exists");
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: emailNorm,
      passwordHash,
    },
  });

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  return { token, user: publicUser(user) };
}

export async function signinUser(input: { email: string; password: string }) {
  const emailNorm = input.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: emailNorm } });
  if (!user) {
    throw new HttpError(401, "Incorrect credentials");
  }

  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) {
    throw new HttpError(401, "Incorrect credentials");
  }

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  return { token, user: publicUser(user) };
}
