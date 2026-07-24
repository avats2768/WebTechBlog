import api from "./axios";

export const loginApi = (data) =>
  api.post("/auth/login", data);

export const registerApi = (data) =>
  api.post("/auth/register", data);

export const profileApi = () =>
  api.get("/user/profile");

export const updatePassword = async (oldPassword, newPassword) => {
  const response = await api.put(
    "/user/update-password",
    null,
    {
      params: {
        oldPassword,
        newPassword,
      },
    }
  );

  return response.data;
};

// Goes through the shared `api` instance so it always resolves against
// VITE_TECH_API_URL (no hardcoded host) and axios handles URL-encoding
// of the token query param for us.
export const verifyEmailApi = (token) =>
  api.get("/auth/verify-email", {
    params: { token },
  });

export const resendVerificationApi = (email) =>
  api.post("/auth/resend-verification-email", null, {
    params: { email },
  });