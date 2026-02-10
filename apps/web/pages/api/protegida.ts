import { verifyToken } from "../../lib/authMiddleware";

export default async function handler(req: any, res: any) {
  const user = await verifyToken(req, res);
  if (!user) return; // Si el usuario no es válido, el middleware ya envió la respuesta

  return res.status(200).json({ message: `Hola, ${user.email}` });
}
