import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();
    setError("");

    try {
      if (isRegistering) {
        await api.post("auth/register/", form);
      }

      const response = await api.post("auth/token/", {
        username: form.username,
        password: form.password,
      });

      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);
      navigate("/");
    } catch {
      setError("Could not sign in. Check your details and try again.");
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h1>MoneyMap</h1>
        <p>{isRegistering ? "Create your account" : "Welcome back"}</p>

        {error && <div className="error">{error}</div>}

        <input
          required
          placeholder="Username"
          value={form.username}
          onChange={(event) => setForm({ ...form, username: event.target.value })}
        />

        {isRegistering && (
          <input
            required
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
          />
        )}

        <input
          required
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
        />

        <button type="submit">
          {isRegistering ? "Create account" : "Sign in"}
        </button>

        <button
          type="button"
          className="text-button"
          onClick={() => setIsRegistering(!isRegistering)}
        >
          {isRegistering
            ? "Already have an account? Sign in"
            : "New here? Create an account"}
        </button>
      </form>
    </div>
  );
}