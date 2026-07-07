import api from "./axios";

/**
 * Get complete chat history
 */
export const getChatHistory = async (roomUuid) => {
  const response = await api.get(
    `/chat/history/${roomUuid}`
  );

  return response.data;
};

/**
 * Get latest 50 messages
 */
export const getLatestMessages = async (roomUuid) => {
  const response = await api.get(
    `/chat/latest/${roomUuid}`
  );

  return response.data;
};

/**
 * Mark message as read
 */
export const markMessageAsRead = async (
  roomUuid,
  messageUuid
) => {

  const response = await api.put(
    `/chat/read/${roomUuid}/${messageUuid}`
  );

  return response.data;
};

export const getMyChats = async () => {

    const response =
        await api.get("/chat/list");

    return response.data;

};

export const createPrivateChat = async (
    receiverUuid
) => {

    const response =
        await api.post(
            "/chat/private",
            {
                receiverUuid
            }
        );

    return response.data;

};

export const getTotalUnreadMessage=async()=>{
  return await api.get("/chat/total-unread-count")
}