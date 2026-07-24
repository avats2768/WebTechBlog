import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Mail } from "lucide-react";
import AuthLayout, { AuthField } from "../../layouts/AuthLayout";

export default function ResendVerification() {

    const [email, setEmail] = useState("");

    const [loading, setLoading] = useState(false);

    const [message, setMessage] = useState("");

    const [error, setError] = useState("");

    const resendEmail = async (e) => {

        e.preventDefault();

        setLoading(true);
        setMessage("");
        setError("");

        try {

            const { data } = await axios.post(
                "http://localhost:8080/api/v1/auth/resend-verification-email",
                {
                    email
                }
            );

            setMessage(data.message);

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Unable to send email."
            );

        } finally {

            setLoading(false);

        }

    };

    return (

        <AuthLayout
            title="Resend Verification Email"
            subtitle="Enter your registered email."
        >

            {message && (
                <div
                    className="alert alert-success"
                    style={{ marginBottom: 16 }}
                >
                    {message}
                </div>
            )}

            {error && (
                <div
                    className="alert alert-danger"
                    style={{ marginBottom: 16 }}
                >
                    {error}
                </div>
            )}

            <form onSubmit={resendEmail}>

                <AuthField
                    icon={Mail}
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) =>
                        setEmail(e.target.value)
                    }
                />

                <button
                    className="btn btn-primary w-full"
                    disabled={loading}
                >
                    {loading
                        ? "Sending..."
                        : "Resend Email"}
                </button>

            </form>

            <div
                style={{
                    textAlign: "center",
                    marginTop: 20
                }}
            >
                <Link to="/login">
                    Back to Login
                </Link>
            </div>

        </AuthLayout>

    );

}