

import api from "./axios"; // your configured axios instance

export const createPost = async (formData) => {
  const response = await api.post(
    "/post/save",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const getAllPosts = () => {
  return api.get("/post/all");
};