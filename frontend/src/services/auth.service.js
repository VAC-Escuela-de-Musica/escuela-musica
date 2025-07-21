import axios from "./root.service";
import cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

export const login = async ({ email, password }) => {
  try {
    const response = await axios.post("auth/login", {
      email,
      password,
    });
    const { status, data } = response;
    if (status === 200) {
      const { email, roles } = jwtDecode(data.data.accessToken);
      localStorage.setItem("user", JSON.stringify({ email, roles }));
      localStorage.setItem("token", data.data.accessToken);
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${data.data.accessToken}`;
    }
  } catch (error) {
    // ...existing code...
  }
};

export const logout = () => {
  localStorage.removeItem("user");
  // Limpiar estado de modales y módulo activo
  localStorage.removeItem("alumnos_editingAlumno");
  localStorage.removeItem("alumnos_showForm");
  localStorage.removeItem("users_editingUser");
  localStorage.removeItem("users_openDialog");
  localStorage.removeItem("carousel_editingImage");
  localStorage.removeItem("carousel_openDialog");
  localStorage.removeItem("activeModule");
  delete axios.defaults.headers.common["Authorization"];
  cookies.remove("jwt");
};

export const test = async () => {
  try {
    const response = await axios.get("/users");
    const { status, data } = response;
    if (status === 200) {
      // ...existing code...
    }
  } catch (error) {
    // ...existing code...
  }
};
