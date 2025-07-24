import axios from "./root.service";

// Función para obtener el valor de una cookie por nombre
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

export const getAlumnos = async () => {
  const token = localStorage.getItem("token");
  return axios.get("/alumnos", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateAlumno = async (id, data, csrfToken) => {
  const token = localStorage.getItem("token");
  return axios.put(`/alumnos/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-CSRF-Token': csrfToken,
    },
  });
};

export const createAlumno = async (data, csrfToken) => {
  const token = localStorage.getItem("token");
  return axios.post("/alumnos", data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-CSRF-Token': csrfToken,
    },
  });
};

export const deleteAlumno = async (id, csrfToken) => {
  const token = localStorage.getItem("token");
  return axios.delete(`/alumnos/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-CSRF-Token': csrfToken,
    },
  });
};
