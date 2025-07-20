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
    if (window.confirm(`¿Eliminar a ${alumno.nombreAlumno}?`)) {
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
            <li
              key={alumno._id}
              style={{
                marginBottom: "2rem",
                padding: "1rem",
                border: "1px solid #ccc",
                borderRadius: "8px",
                background: "#23272f",
                color: "#f5f5f5",
              }}
            >
              {/* Datos del Alumno */}
              <h3 style={{ marginBottom: "0.5rem", color: "#444" }}>
                Datos del Alumno
              </h3>
              <strong>Nombre Alumno:</strong> {alumno.nombreAlumno} <br />
              <strong>RUT Alumno:</strong> {alumno.rutAlumno} <br />
              <strong>Edad Alumno:</strong> {alumno.edadAlumno} <br />
              <strong>Teléfono Alumno:</strong> {alumno.telefonoAlumno} <br />
              <strong>Email:</strong> {alumno.email} <br />
              <strong>Fecha de Ingreso:</strong> {alumno.fechaIngreso} <br />
              <hr style={{ margin: "1rem 0" }} />
              {/* Datos de Clase */}
              <h3 style={{ marginBottom: "0.5rem", color: "#444" }}>
                Datos de Clase
              </h3>
              <strong>Curso:</strong> {alumno.curso} <br />
              <strong>Tipo de Curso:</strong> {alumno.tipoCurso} <br />
              <strong>Modalidad de Clase:</strong> {alumno.modalidadClase}{" "}
              <br />
              <strong>Día:</strong>{" "}
              {alumno.clase ? alumno.clase.split(" ")[0] : ""} <br />
              <strong>Hora:</strong>{" "}
              {alumno.clase ? alumno.clase.split(" ")[1] : ""} <br />
              <hr style={{ margin: "1rem 0" }} />
              {/* Otros Datos */}
              <h3 style={{ marginBottom: "0.5rem", color: "#444" }}>
                Otros Datos
              </h3>
              <strong>RRSS:</strong> {alumno.rrss} <br />
              <strong>Conocimientos Previos:</strong>{" "}
              {alumno.conocimientosPrevios ? "Sí" : "No"} <br />
              <strong>Instrumentos:</strong>{" "}
              {Array.isArray(alumno.instrumentos)
                ? alumno.instrumentos.join(", ")
                : ""}{" "}
              <br />
              <strong>Estilos Musicales:</strong>{" "}
              {Array.isArray(alumno.estilosMusicales)
                ? alumno.estilosMusicales.join(", ")
                : ""}{" "}
              <br />
              <strong>Otro Estilo:</strong> {alumno.otroEstilo} <br />
              <strong>Referente Musical:</strong> {alumno.referenteMusical}{" "}
              <br />
              <strong>Condición de Aprendizaje:</strong>{" "}
              {alumno.condicionAprendizaje ? "Sí" : "No"} <br />
              <strong>Detalle Condición de Aprendizaje:</strong>{" "}
              {alumno.detalleCondicionAprendizaje} <br />
              <strong>Condición Médica:</strong>{" "}
              {alumno.condicionMedica ? "Sí" : "No"} <br />
              <strong>Detalle Condición Médica:</strong>{" "}
              {alumno.detalleCondicionMedica} <br />
              <strong>Observaciones:</strong> {alumno.observaciones} <br />
              <hr style={{ margin: "1rem 0" }} />
              {/* Datos del Apoderado */}
              <h3 style={{ marginBottom: "0.5rem", color: "#444" }}>
                Datos del Apoderado
              </h3>
              <strong>Nombre Apoderado:</strong> {alumno.nombreApoderado} <br />
              <strong>RUT Apoderado:</strong> {alumno.rutApoderado} <br />
              <strong>Teléfono Apoderado:</strong> {alumno.telefonoApoderado}{" "}
              <br />
              <strong>Dirección:</strong> {alumno.direccion} <br />
              <div style={{ marginTop: "1rem" }}>
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
              </div>
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
