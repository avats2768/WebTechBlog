import api from "./axios";

export const getBookmarks = async () => {
  const response = await api.get("/bookmark/my");
  return response.data;
};

export const toggleBookmark = async (postId) => {
  const response = await api.post(`/bookmark/toggle/${postId}`);
  return response;
};