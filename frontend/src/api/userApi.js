import api from "./axios";

export const getProfile = () => {
  return api.get("/profile");
};

// for public user Profiles
export const getUserProfile = async (uuid) => {
  const response = await api.get(`/profile/${uuid}`);
  return response.data;
};

export const updateProfile = (data) => {
  return api.put("/profile/update", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};