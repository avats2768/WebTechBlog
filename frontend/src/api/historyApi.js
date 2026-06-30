import api from "./axios";

/**
 * Get complete activity history
 * GET /history
 */
export const getHistory = async () => {
  const response = await api.get("/history");
  return response.data;
};

/**
 * Get history by activity type
 * VIEW
 * LIKE
 * COMMENT
 * BOOKMARK
 *
 * Example:
 * getHistoryByType("LIKE")
 */
export const getHistoryByType = async (activityType) => {
  const response = await api.get(`/history/${activityType}`);
  return response.data;
};