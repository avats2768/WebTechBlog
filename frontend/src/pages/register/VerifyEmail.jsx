import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const VerifyEmail = () => {

    const [searchParams] = useSearchParams();

    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    useEffect(() => {

        const token = searchParams.get("token");

        if (!token) {
            setMessage("Invalid verification link.");
            setLoading(false);
            return;
        }

        verify(token);

    }, []);

    const verify = async (token) => {

        try {

            const response = await axios.get(
                `/auth/verify-email?token=${token}`
            );

            setMessage(response.data.message);

            setTimeout(() => {
                navigate("/login");
            }, 3000);

        } catch (error) {

            setMessage(
                error.response?.data?.message ||
                "Verification failed."
            );

        } finally {

            setLoading(false);

        }

    };

    return (

        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "100vh"
            }}
        >

            <div
                style={{
                    width: "420px",
                    padding: "30px",
                    borderRadius: "12px",
                    background: "#fff",
                    boxShadow: "0 0 20px rgba(0,0,0,.1)"
                }}
            >

                <h2>Email Verification</h2>

                {
                    loading
                        ? <p>Verifying your email...</p>
                        : <p>{message}</p>
                }

            </div>

        </div>

    );

};

export default VerifyEmail;