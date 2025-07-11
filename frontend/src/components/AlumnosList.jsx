import { useEffect, useState } from "react";
import { getAlumnos } from "../services/alumnos.service";

function AlumnosList() {
  const [alumnos, setAlumnos] = useState([]);

  useEffect(() => {
    getAlumnos()
      .then((res) => setAlumnos(res.data.data || res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h2>Lista de Alumnos</h2>
      <ul>
        {alumnos.map((alumno) => (
          <li key={alumno._id}>
            {alumno.name} - {alumno.email}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AlumnosList;
