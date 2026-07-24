import api from "./axios";

/**
 * Get call history of a chat room
 */
export const getMyCallHistory = async () => {

    const response =
        await api.get("/call/history");

    return response.data.data;
};

export const getRoomCallHistory = async (roomUuid) => {

    const response =
        await api.get(`/call/history/${roomUuid}`);

    return response.data.data;
};