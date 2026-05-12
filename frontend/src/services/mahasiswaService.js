import api from "./api";

export const getMahasiswa = (search) => api.get("/mahasiswa", { params: { search } });
export const getMahasiswaById = (id) => api.get(`/mahasiswa/${id}`);
export const createMahasiswa = (data) => api.post("/mahasiswa", data);
export const updateMahasiswa = (id, data) => api.put(`/mahasiswa/${id}`, data);
export const deleteMahasiswa = (id) => api.delete(`/mahasiswa/${id}`);
export const assignPa = (id, dosenPAId) => api.put(`/mahasiswa/${id}/pa`, { dosenPAId });
export const getMyMahasiswaProfile = () => api.get("/mahasiswa/me");
export const updateMyProfile = (data) => api.put("/mahasiswa/me", data);
export const getMyDosenPa = () => api.get("/mahasiswa/me/dosen-pa");
