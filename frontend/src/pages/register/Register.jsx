import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Lock } from "lucide-react";

import { registerApi } from "../../api/authApi";

import { useDispatch } from "react-redux";
import { loginSuccess } from "../../features/auth/authSlice";
import AuthLayout, { AuthField } from "../../layouts/AuthLayout"; // adjust path if needed

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [form, setForm] = useState({
  username: "",
  email: "",
  password: "",
  role: "USER",
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

      const { data } = await registerApi(form);

      dispatch(
        loginSuccess({
          token: data.token,
          user: {
            uuid: data.uuid,
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
          "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join ConnectX in a few seconds."
      footer={
        <p className="body-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-brand" style={{ fontWeight: 600 }}>
            Login
          </Link>
        </p>
      }
    >
      {error && <div className="alert alert-danger" style={{ marginBottom: 16 }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <AuthField
          icon={User}
          label="Username"
          name="username"
          placeholder="yourusername"
          value={form.username}
          onChange={handleChange}
        />

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

        <div style={{ marginBottom: 16 }}>
  <label
    style={{
      display: "block",
      marginBottom: 6,
      fontWeight: 500,
    }}
  >
    Role
  </label>

  <select
    name="role"
    value={form.role}
    onChange={handleChange}
    className="input"
    style={{
      width: "100%",
      padding: "12px",
      border: "1px solid #ddd",
      borderRadius: "8px",
    }}
  >
    <option value="USER">User</option>
    <option value="ADMIN">Admin</option>
  </select>
</div>

        <button type="submit" disabled={loading} className="btn btn-primary w-full" style={{ marginTop: 8 }}>
          {loading ? "Creating…" : "Register"}
        </button>
      </form>
    </AuthLayout>
  );
}