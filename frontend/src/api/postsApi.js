

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

export const getPostByUser = ()=>{
  return api.get(`/post/my-post`);
}

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

  export const getLikeStatus = (postId) =>
  api.get("/post/likes/status", {
    params: {
      postId,
    },
  });