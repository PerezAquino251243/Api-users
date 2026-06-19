import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const path = request.nextUrl.pathname;

  // 🔒 Ruta protegida: /usuarios y cualquier subruta
  if (path.startsWith("/usuarios")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch (error) {
      console.error("Token inválido:", error);
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // 🔄 Si ya está logueado y va a /login, redirigir a /usuarios
  if (path === "/login" && token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token, secret);
      return NextResponse.redirect(new URL("/usuarios", request.url));
    } catch {
      // Token inválido, dejar pasar al login
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/usuarios/:path*", "/login"],
};