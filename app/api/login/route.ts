import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// 🔹 Datos de ejemplo (reemplázalos con tu base de datos)
// Puedes importar tus usuarios desde lib/db.ts
const users = [
  { id: 1, email: "admin@test.com", password: "123456" },
  { id: 2, email: "user@test.com", password: "password" },
];

export async function POST(request: Request) {
  const { email, password } = await request.json();

  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return NextResponse.json(
      { error: "Credenciales inválidas" },
      { status: 401 }
    );
  }

  // Generar JWT
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: "1d" }
  );

  const response = NextResponse.json({ success: true });

  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 1 día
    path: "/",
  });

  return response;
}