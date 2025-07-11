import axios from "axios";

export const getAlumnos = async () => {
  const token = localStorage.getItem("token"); // O usa tu contexto de Auth
  return axios.get("http://localhost:1230/api/alumnos", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true, // solo si tu backend lo requiere
  });
};

export const updateAlumno = async (id, data) => {
  const token = localStorage.getItem("token"); // O usa tu contexto de Auth
  return axios.put(`http://localhost:1230/api/alumnos/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true, // solo si tu backend lo requiere
  });
};

export const createAlumno = async (data) => {
  const token = localStorage.getItem("token"); // O usa tu contexto de Auth
  return axios.post("http://localhost:1230/api/alumnos", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true, // solo si tu backend lo requiere
  });
};

export const deleteAlumno = async (id) => {
  const token = localStorage.getItem("token"); // O usa tu contexto de Auth
  return axios.delete(`http://localhost:1230/api/alumnos/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true, // solo si tu backend lo requiere
  });
};
