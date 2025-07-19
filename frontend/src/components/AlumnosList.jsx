import { useEffect, useState } from "react";
import {
  getAlumnos,
  updateAlumno,
  createAlumno,
  deleteAlumno,
} from "../services/alumnos.service";
import AlumnoForm from "./AlumnoForm";

function AlumnosList() {
  const [alumnos, setAlumnos] = useState([]);
  const [editingAlumno, setEditingAlumno] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchAlumnos = () => {
    getAlumnos()
      .then((res) => setAlumnos(res.data.data || res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchAlumnos();
  }, []);

  const handleCreate = () => {
    setEditingAlumno(null);
    setShowForm(true);
  };
  const handleEdit = (alumno) => {
    setEditingAlumno(alumno);
    setShowForm(true);
  };
  const handleDelete = async (alumno) => {
    if (window.confirm(`¿Eliminar a ${alumno.name}?`)) {
      try {
        await deleteAlumno(alumno._id);
        fetchAlumnos();
      } catch (err) {
        alert("Error al eliminar alumno");
      }
    }
  };
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingAlumno(null);
  };
  const handleSubmitForm = async (formData) => {
    if (editingAlumno && editingAlumno._id) {
      // Editar alumno existente
      try {
        await updateAlumno(editingAlumno._id, formData);
        fetchAlumnos();
        setShowForm(false);
        setEditingAlumno(null);
      } catch (err) {
        alert("Error al actualizar alumno");
      }
    } else {
      // Crear nuevo alumno
      try {
        await createAlumno(formData);
        fetchAlumnos();
        setShowForm(false);
        setEditingAlumno(null);
      } catch (err) {
        alert("Error al crear alumno");
      }
    }
  };

  // Asegura que alumnos sea siempre un array
  const alumnosArray = Array.isArray(alumnos) ? alumnos : [];

  return (
    <div>
      <h2>Lista de Alumnos</h2>
      <button onClick={handleCreate} style={{ marginBottom: "1rem" }}>
        Agregar Alumno
      </button>
      <ul>
        {alumnosArray.length === 0 ? (
          <li style={{ color: "#888" }}>No hay alumnos registrados.</li>
        ) : (
          alumnosArray.map((alumno) => (
            <li key={alumno._id} style={{ marginBottom: "1rem" }}>
              <strong>Nombre:</strong> {alumno.name} <br />
              <strong>RUT:</strong> {alumno.rut} <br />
              <strong>Dirección:</strong> {alumno.address} <br />
              <strong>Teléfono:</strong> {alumno.phone} <br />
              <strong>Email:</strong> {alumno.email} <br />
              <strong>Fecha de ingreso:</strong>{" "}
              {alumno.fechaIngreso
                ? new Date(alumno.fechaIngreso).toLocaleDateString()
                : ""}{" "}
              <br />
              <button
                onClick={() => handleEdit(alumno)}
                style={{ marginRight: "0.5rem" }}
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(alumno)}
                style={{ color: "red" }}
              >
                Eliminar
              </button>
            </li>
          ))
        )}
      </ul>
      {showForm && (
        <AlumnoForm
          initialData={editingAlumno}
          onSubmit={handleSubmitForm}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}

export default AlumnosList;
