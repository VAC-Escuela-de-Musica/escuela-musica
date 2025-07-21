import axios from "./root.service";

export const getAlumnos = async () => {
  const token = localStorage.getItem("token");
  return axios.get("/alumnos", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateAlumno = async (id, data) => {
  const token = localStorage.getItem("token");
  return axios.put(`/alumnos/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const createAlumno = async (data) => {
  const token = localStorage.getItem("token");
  return axios.post("/alumnos", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const deleteAlumno = async (id) => {
  const token = localStorage.getItem("token");
  return axios.delete(`/alumnos/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
