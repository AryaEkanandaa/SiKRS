import api from "./api";

export const getProgramStudi = () => api.get("/program-studi");
export const getProgramStudiById = (id) => api.get(`/program-studi/${id}`);
export const createProgramStudi = (data) => api.post("/program-studi", data);
export const updateProgramStudi = (id, data) => api.put(`/program-studi/${id}`, data);
export const deleteProgramStudi = (id) => api.delete(`/program-studi/${id}`);
