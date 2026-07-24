import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import AuthLayout from "../../layouts/AuthLayout";

export default function VerifyEmail() {

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {

        const token = searchParams.get("token");

        if (!token) {
            setLoading(false);
            setSuccess(false);
            setMessage("Invalid verification link.");
            return;
        }

        verifyEmail(token);

    }, []);

    const verifyEmail = async (token) => {

        try {

            const { data } = await axios.get(
                `http://localhost:8080/api/v1/auth/verify-email?token=${token}`
            );

            setSuccess(true);
            setMessage(data.message);

        } catch (err) {

            setSuccess(false);
            setMessage(
                err.response?.data?.message ||
                "Unable to verify your email."
            );

        } finally {

            setLoading(false);

        }

    };

    return (

        <AuthLayout
            title="Email Verification"
            subtitle="Verifying your account..."
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
                            marginBottom: 20
                        }}
                    >
                        ✓
                    </div>

                    <h2>Email Verified</h2>

                    <p style={{ marginTop: 10 }}>
                        {message}
                    </p>

                    <button
                        className="btn btn-primary"
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
                            marginBottom: 20
                        }}
                    >
                        ✕
                    </div>

                    <h2>Verification Failed</h2>

                    <p style={{ marginTop: 10 }}>
                        {message}
                    </p>

                    <Link
                        to="/resend-verification"
                        className="btn btn-primary"
                        style={{
                            display: "inline-block",
                            marginTop: 25
                        }}
                    >
                        Resend Verification Email
                    </Link>

                </div>

            )}

        </AuthLayout>

    );

}