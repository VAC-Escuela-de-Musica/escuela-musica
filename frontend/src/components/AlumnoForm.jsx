import { useState, useEffect } from "react";

function AlumnoForm({ initialData = {}, onSubmit, onClose }) {
  const [form, setForm] = useState({
    // Datos del alumno
    nombreAlumno: "",
    rutAlumno: "",
    edadAlumno: "",
    direccion: "",
    telefonoAlumno: "",
    email: "",
    fechaIngreso: "",

    // Datos del apoderado
    nombreApoderado: "",
    rutApoderado: "",
    telefonoApoderado: "",

    // Otros datos
    rrss: "",
    conocimientosPrevios: false,
    instrumentos: [],
    estilosMusicales: [],
    otroEstilo: "",
    referenteMusical: "",
    condicionAprendizaje: false,
    detalleCondicionAprendizaje: "",
    condicionMedica: false,
    detalleCondicionMedica: "",
    observaciones: "",
    curso: "",
    tipoCurso: "",
    modalidadClase: "",
    dia: "",
    hora: "",
    ...initialData,
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  useEffect(() => {
    if (initialData && initialData.fechaIngreso) {
      setForm((prev) => ({
        ...prev,
        fechaIngreso: new Date(initialData.fechaIngreso)
          .toISOString()
          .split("T")[0],
      }));
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Limpia el error anterior
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err.message || "Error al guardar el alumno");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#222",
          padding: 24,
          borderRadius: 8,
          minWidth: 320,
        }}
      >
        {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
        <h3>
          {initialData && initialData._id ? "Editar Alumno" : "Agregar Alumno"}
        </h3>
        <label>
          Nombre Apoderado:
          <br />
          <input
            name="nombreApoderado"
            value={form.nombreApoderado}
            onChange={handleChange}
          />
        </label>
        <br />
        <label>
          RUT Apoderado:
          <br />
          <input
            name="rutApoderado"
            value={form.rutApoderado}
            onChange={handleChange}
          />
        </label>
        <br />
        <label>
          Telefono Apoderado:
          <br />
          <input
            name="telefonoApoderado"
            value={form.telefonoApoderado}
            onChange={handleChange}
          />
        </label>
        <br />
        <label>
          Dirección:
          <br />
          <input
            name="direccion"
            value={form.direccion}
            onChange={handleChange}
          />
        </label>
        <br />
        <label>
          Nombre Alumno:
          <br />
          <input
            name="nombreAlumno"
            value={form.nombreAlumno}
            onChange={handleChange}
            required
          />
        </label>
        <br />
        <label>
          RUT Alumno:
          <br />
          <input
            name="rutAlumno"
            value={form.rutAlumno}
            onChange={handleChange}
            required
          />
        </label>
        <br />
        <label>
          Edad Alumno:
          <br />
          <input
            name="edadAlumno"
            value={form.edadAlumno}
            onChange={handleChange}
            type="number"
            required
          />
        </label>
        <br />
        <label>
          Teléfono Alumno:
          <br />
          <input
            name="telefonoAlumno"
            value={form.telefonoAlumno}
            onChange={handleChange}
          />
        </label>
        <br />
        <label>
          RRSS:
          <br />
          <input name="rrss" value={form.rrss} onChange={handleChange} />
        </label>
        <br />
        <label>
          Conocimientos Previos:
          <input
            type="checkbox"
            name="conocimientosPrevios"
            checked={form.conocimientosPrevios}
            onChange={(e) =>
              setForm({ ...form, conocimientosPrevios: e.target.checked })
            }
          />
        </label>
        <br />
        <label>
          Instrumentos (Separados por comas):
          <br />
          <input
            name="instrumentos"
            value={form.instrumentos.join(", ")}
            onChange={(e) =>
              setForm({
                ...form,
                instrumentos: e.target.value.split(",").map((i) => i.trim()),
              })
            }
            placeholder="Ej: Guitarra, Piano"
          />
        </label>
        <br />
        <label>
          Estilos Musicales (Separados por comas):
          <br />
          <input
            name="estilosMusicales"
            value={form.estilosMusicales.join(", ")}
            onChange={(e) =>
              setForm({
                ...form,
                estilosMusicales: e.target.value
                  .split(",")
                  .map((i) => i.trim()),
              })
            }
            placeholder="Ej: Rock, Jazz"
          />
        </label>
        <br />
        <label>
          Otro Estilo:
          <br />
          <input
            name="otroEstilo"
            value={form.otroEstilo}
            onChange={handleChange}
          />
        </label>
        <br />
        <label>
          Referente Musical:
          <br />
          <input
            name="referenteMusical"
            value={form.referenteMusical}
            onChange={handleChange}
          />
        </label>
        <br />
        <label>
          Condición de Aprendizaje:
          <input
            type="checkbox"
            name="condicionAprendizaje"
            checked={form.condicionAprendizaje}
            onChange={(e) =>
              setForm({ ...form, condicionAprendizaje: e.target.checked })
            }
          />
        </label>
        <br />
        <label>
          Detalle Condición de Aprendizaje:
          <br />
          <input
            name="detalleCondicionAprendizaje"
            value={form.detalleCondicionAprendizaje}
            onChange={handleChange}
          />
        </label>
        <br />
        <label>
          Condición Médica:
          <input
            type="checkbox"
            name="condicionMedica"
            checked={form.condicionMedica}
            onChange={(e) =>
              setForm({ ...form, condicionMedica: e.target.checked })
            }
          />
        </label>
        <br />
        <label>
          Detalle Condición Médica:
          <br />
          <input
            name="detalleCondicionMedica"
            value={form.detalleCondicionMedica}
            onChange={handleChange}
          />
        </label>
        <br />
        <label>
          Observaciones:
          <br />
          <textarea
            name="observaciones"
            value={form.observaciones}
            onChange={handleChange}
            rows="4"
            style={{ width: "100%" }}
          />
        </label>
        <br />
        <label>
          Curso:
          <br />
          <input name="curso" value={form.curso} onChange={handleChange} />
        </label>
        <br />
        <label>
          Tipo de Curso:
          <br />
          <input
            name="tipoCurso"
            value={form.tipoCurso}
            onChange={handleChange}
          />
        </label>
        <br />
        <label>
          Modalidad de Clase:
          <br />
          <input
            name="modalidadClase"
            value={form.modalidadClase}
            onChange={handleChange}
          />
        </label>
        <br />
        <label>
          Día:
          <br />
          <input name="dia" value={form.dia} onChange={handleChange} />
        </label>
        <br />
        <label>
          Hora:
          <br />
          <input name="hora" value={form.hora} onChange={handleChange} />
        </label>
        <br />
        <button type="submit">Guardar</button>
        <button type="button" onClick={onClose} style={{ marginLeft: 8 }}>
          Cancelar
        </button>
      </form>
    </div>
  );
}

export default AlumnoForm;
