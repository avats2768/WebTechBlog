import api from "./axios";

export const AiPrompt = (data) =>
  api.get(`/ai/${data}`);