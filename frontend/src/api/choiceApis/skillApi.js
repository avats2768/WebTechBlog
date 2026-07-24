import api from "../axios";

export const getSkills = async () => {
  const response = await api.get("/skills");

  return response.data;
};

export const getSkillsByIds = async (ids) => {
  const response = await api.post("/skills/by-ids", ids);

  return response.data;
};