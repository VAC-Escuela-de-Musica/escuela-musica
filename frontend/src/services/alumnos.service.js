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
