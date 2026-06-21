import api from "./axios";

export const getProfile = () => {
  return api.get("/profile");
};

export const updateProfile = (data) => {
  return api.put("/profile/update", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};