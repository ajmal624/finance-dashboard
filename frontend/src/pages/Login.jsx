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
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function getErrorMessage(error) {
    const data = error?.response?.data;

    if (!data) {
      return "Unable to connect to the server. Please try again.";
    }

    if (typeof data.detail === "string") {
      return data.detail;
    }

    if (typeof data === "string") {
      return data;
    }

    if (typeof data === "object") {
      const messages = [];

      Object.entries(data).forEach(([field, value]) => {
        if (Array.isArray(value)) {
          messages.push(`${field}: ${value.join(", ")}`);
        } else if (typeof value === "string") {
          messages.push(`${field}: ${value}`);
        }
      });

      if (messages.length > 0) {
        return messages.join(" ");
      }
    }

    return "Could not complete the request. Please check your details.";
  }

  async function submit(event) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Remove old tokens before starting a new authentication flow.
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      if (isRegistering) {
        await api.post("auth/register/", {
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
        });
      }

      const response = await api.post("auth/token/", {
        username: form.username.trim(),
        password: form.password,
      });

      const { access, refresh } = response.data;

      if (!access || !refresh) {
        throw new Error("Authentication tokens were not returned.");
      }

      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);

      navigate("/", { replace: true });
    } catch (requestError) {
      console.error("Authentication error:", requestError);
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  function toggleMode() {
    setIsRegistering((current) => !current);
    setError("");
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h1>MoneyMap</h1>

        <p>
          {isRegistering
            ? "Create your account"
            : "Welcome back"}
        </p>

        {error && <div className="error">{error}</div>}

        <input
          required
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          autoComplete="username"
        />

        {isRegistering && (
          <input
            required
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
          />
        )}

        <input
          required
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          autoComplete={
            isRegistering ? "new-password" : "current-password"
          }
        />

        <button type="submit" disabled={loading}>
          {loading
            ? isRegistering
              ? "Creating account..."
              : "Signing in..."
            : isRegistering
              ? "Create account"
              : "Sign in"}
        </button>

        <button
          type="button"
          className="text-button"
          onClick={toggleMode}
          disabled={loading}
        >
          {isRegistering
            ? "Already have an account? Sign in"
            : "New here? Create an account"}
        </button>
      </form>
    </div>
  );
}