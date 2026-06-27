import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock } from "lucide-react";

import { loginApi } from "../../api/authApi";
import { loginSuccess } from "../../features/auth/authSlice";
import AuthLayout, { AuthField } from "../../layouts/AuthLayout"; // adjust path if needed

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setError("");

    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const { data } = await loginApi(form);

      dispatch(
        loginSuccess({
          token: data.token,
          user: {
            uuid: data.uuid,
            userId:data.userId,
            username: data.username,
            email: data.email,
            role: data.role,
          },
        })
      );

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to continue to ConnectX."
      footer={
        <p className="body-sm">
          No account?{" "}
          <Link to="/register" className="text-brand" style={{ fontWeight: 600 }}>
            Register
          </Link>
        </p>
      }
    >
      {error && <div className="alert alert-danger" style={{ marginBottom: 16 }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <AuthField
          icon={Mail}
          label="Email"
          type="email"
          name="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
        />

        <AuthField
          icon={Lock}
          label="Password"
          type="password"
          name="password"
          placeholder="••••••••"
          value={form.password}
          onChange={handleChange}
        />

        <button type="submit" disabled={loading} className="btn btn-primary w-full" style={{ marginTop: 8 }}>
          {loading ? "Logging in…" : "Login"}
        </button>
      </form>
    </AuthLayout>
  );
}