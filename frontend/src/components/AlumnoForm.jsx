import { useState, useEffect } from "react";

function AlumnoForm({ initialData = {}, onSubmit, onClose }) {
  const [form, setForm] = useState({
    name: "",
    rut: "",
    address: "",
    phone: "",
    email: "",
    fechaIngreso: "",
    ...initialData,
  });

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
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
        <h3>{initialData._id ? "Editar Alumno" : "Agregar Alumno"}</h3>
        <label>
          Nombre:
          <br />
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </label>
        <br />
        <label>
          RUT:
          <br />
          <input name="rut" value={form.rut} onChange={handleChange} required />
        </label>
        <br />
        <label>
          Dirección:
          <br />
          <input name="address" value={form.address} onChange={handleChange} />
        </label>
        <br />
        <label>
          Teléfono:
          <br />
          <input name="phone" value={form.phone} onChange={handleChange} />
        </label>
        <br />
        <label>
          Email:
          <br />
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>
        <br />
        <label>
          Fecha de ingreso:
          <br />
          <input
            name="fechaIngreso"
            type="date"
            value={form.fechaIngreso}
            onChange={handleChange}
            required
          />
        </label>
        <br />
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
