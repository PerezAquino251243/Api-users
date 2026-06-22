"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  console.log("Respuesta:", data, "status:", res.status);

  if (!res.ok) {
    setError(data.error || "Error al iniciar sesión");
    setLoading(false);
    return;
  }

  console.log("Login exitoso, redirigiendo...");
  router.push("/usuarios");
};

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 300, margin: "auto" }}>
      <h2>Iniciar sesión</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        style={{ width: "100%", padding: 8, marginBottom: 8 }}
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        style={{ width: "100%", padding: 8, marginBottom: 8 }}
      />
      <button type="submit" disabled={loading}>
        {loading ? "Cargando..." : "Entrar"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
}