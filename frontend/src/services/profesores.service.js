import axios from './api.service.js'
import { API_HEADERS } from '../config/api.js'

// Obtener todos los profesores
export const getProfesores = async () => {
  const token = localStorage.getItem("token");
  return axios.get("/profesores", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Obtener profesores activos
export const getProfesoresActivos = async () => {
  const token = localStorage.getItem("token");
  return axios.get("/profesores/activos/lista", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Obtener un profesor por ID
export const getProfesor = async (id) => {
  const token = localStorage.getItem("token");
  return axios.get(`/profesores/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Crear un nuevo profesor
export const createProfesor = async (data, csrfToken) => {
  console.log('🔍 [CREATE-PROFESOR] Iniciando creación de profesor')
  console.log('🔍 [CREATE-PROFESOR] Data:', data)
  console.log('🔍 [CREATE-PROFESOR] CSRF Token:', csrfToken)
  
  const headers = {
    ...API_HEADERS.withAuth(),
    'X-CSRF-Token': csrfToken,
  }
  
  console.log('🔍 [CREATE-PROFESOR] Headers:', headers)
  
  return axios.post("/profesores", data, { headers });
};

// Actualizar un profesor
export const updateProfesor = async (id, data, csrfToken) => {
  const token = localStorage.getItem("token");
  return axios.put(`/profesores/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-CSRF-Token': csrfToken,
    },
  });
};

// Eliminar un profesor
export const deleteProfesor = async (id) => {
  const token = localStorage.getItem("token");
  return axios.delete(`/profesores/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Obtener profesor por email
export const getProfesorByEmail = async (email) => {
  const token = localStorage.getItem("token");
  return axios.get(`/profesores/email/${email}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Cambiar estado activo/inactivo de un profesor
export const toggleProfesorStatus = async (id) => {
  const token = localStorage.getItem("token");
  return axios.put(`/profesores/${id}/toggle-status`, {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}; 