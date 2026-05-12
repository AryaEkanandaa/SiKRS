import api from "./api";

export const getUsers = () => api.get("/users");
export const getUser = (id) => api.get(`/users/${id}`);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);
export const linkUser = (id, entityType, entityId) => api.put(`/users/${id}/link`, { entityType, entityId });
export const unlinkUser = (id) => api.post(`/users/${id}/unlink`);
