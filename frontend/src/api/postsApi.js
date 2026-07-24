

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

export const getAllPosts = (page = 0, size = 10) => {
  return api.get("/post/all", {
    params: { page, size },
  });
};

export const getPostById = (id) => {
  return api.get(`/post/${id}`);
};

export const updatePost = (id, payload) => {
  return api.put(`/post/save/${id}`, payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const getMyPosts = (page = 0, size = 10) => {
  return api.get(`/post/my-post`, { params: { page, size } });
};

export const getUserPosts = (userUuid, page = 0, size = 10) => {
  return api.get(`/post/user/${userUuid}`, {
    params: { page, size },
  });
};

export const deletePost = (id) => {
  return api.delete(`/post/${id}`);
};

export const toggleLike = (postId) =>
  api.post(`/post/likes/toggle?postId=${postId}`);

export const getComments = (postId) =>
  api.get(`/post/comments/${postId}`);

export const addComment = (postId, comment) =>
  api.post(`/post/comments/add`, null, {
    params: {
      postId,
      comment,
    },
  });

export const deleteComment = (commentId) =>
  api.delete(`/post/comments/delete/${commentId}`);

export const getLikedPosts = async () => {
  return await api.get("/post/likes/liked");
};

  export const getLikeStatus = (postId) =>
  api.get("/post/likes/status", {
    params: {
      postId,
    },
  });