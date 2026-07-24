import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { verifyEmailApi } from "../../api/authApi";
import AuthLayout from "../../layouts/AuthLayout";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  // Verification tokens are single-use on the backend. In React 18
  // StrictMode (dev) effects run twice on mount, which would fire the
  // request twice and turn a real success into a false "Verification
  // Failed" on the second call. This ref makes the effect idempotent.
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const token = searchParams.get("token");

    if (!token) {
      setLoading(false);
      setSuccess(false);
      setMessage("Invalid verification link. No token was provided.");
      return;
    }

    verifyEmail(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const verifyEmail = async (token) => {
    try {
      const { data } = await verifyEmailApi(token);

      setSuccess(true);
      setMessage(data?.message || "Your email has been verified successfully.");
    } catch (err) {
      setSuccess(false);
      setMessage(
        err.response?.data?.message ||
          "We couldn't verify your email. The link may be invalid or expired."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Email Verification"
      subtitle={loading ? "Verifying your account..." : "Verification complete"}
    >
      {loading && (
        <div className="text-center">
          <h3>Verifying...</h3>
          <p>Please wait while we verify your email.</p>
        </div>
      )}

      {!loading && success && (
        <div className="text-center">
          <div
            style={{
              fontSize: 70,
              color: "#22c55e",
              marginBottom: 20,
            }}
          >
            ✓
          </div>

          <h2>Email Verified</h2>

          <p style={{ marginTop: 10 }}>{message}</p>

          <button
            className="btn btn-primary w-full"
            style={{ marginTop: 25 }}
            onClick={() => navigate("/login")}
          >
            Login Now
          </button>
        </div>
      )}

      {!loading && !success && (
        <div className="text-center">
          <div
            style={{
              fontSize: 70,
              color: "#ef4444",
              marginBottom: 20,
            }}
          >
            ✕
          </div>

          <h2>Verification Failed</h2>

          <p style={{ marginTop: 10 }}>{message}</p>

          <Link
            to="/resend-verification"
            className="btn btn-primary w-full"
            style={{
              display: "inline-block",
              marginTop: 25,
            }}
          >
            Resend Verification Email
          </Link>
        </div>
      )}
    </AuthLayout>
  );
}