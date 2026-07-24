import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { resendVerificationApi } from "../../api/authApi";
import AuthLayout, { AuthField } from "../../layouts/AuthLayout";

const COOLDOWN_SECONDS = 60;

export default function ResendVerification() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  // Guards against a double-submit (e.g. rapid double click / double
  // Enter) firing two in-flight requests before React state updates.
  const inFlightRef = useRef(false);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const resendEmail = async (e) => {
    e.preventDefault();

    if (inFlightRef.current || loading || cooldown > 0) return;

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    inFlightRef.current = true;
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const { data } = await resendVerificationApi(trimmedEmail);

      setMessage(
        data?.message ||
          "If an account exists for this email, a verification link has been sent."
      );
      setCooldown(COOLDOWN_SECONDS);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to send the verification email. Please try again."
      );
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  };

  const buttonLabel = loading
    ? "Sending..."
    : cooldown > 0
    ? `Resend available in ${cooldown}s`
    : "Resend Email";

  return (
    <AuthLayout
      title="Resend Verification Email"
      subtitle="Enter your registered email."
    >
      {message && (
        <div className="alert alert-success" style={{ marginBottom: 16 }}>
          {message}
        </div>
      )}

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: 16 }}>
          {error}
        </div>
      )}

      <form onSubmit={resendEmail}>
        <AuthField
          icon={Mail}
          label="Email"
          type="email"
          name="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setError("");
            setEmail(e.target.value);
          }}
          required
        />

        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={loading || cooldown > 0}
        >
          {buttonLabel}
        </button>
      </form>

      <div style={{ textAlign: "center", marginTop: 20 }}>
        <Link to="/login">Back to Login</Link>
      </div>
    </AuthLayout>
  );
}