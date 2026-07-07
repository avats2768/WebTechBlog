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