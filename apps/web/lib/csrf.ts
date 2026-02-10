import { nanoid } from "nanoid";
import { NextApiRequest, NextApiResponse } from "next";
import { serialize, parse } from "cookie";

// Generar un token CSRF y establecerlo en una cookie
export function setCsrfCookie(res: NextApiResponse): string {
  const token = nanoid();
  const csrfCookie = serialize("csrfToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  res.setHeader("Set-Cookie", csrfCookie);
  return token;
}

// Validar el token CSRF
export function validateCsrfToken(req: NextApiRequest): boolean {
  const cookies = parse(req.headers.cookie || "");
  const csrfTokenFromCookie = cookies["csrfToken"];
  const csrfTokenFromHeader = req.headers["x-csrf-token"] as string;

  if (!csrfTokenFromCookie || !csrfTokenFromHeader) {
    console.error("CSRF token missing:", {
      csrfTokenFromCookie,
      csrfTokenFromHeader,
    });
    return false;
  }

  return csrfTokenFromCookie === csrfTokenFromHeader;
}
