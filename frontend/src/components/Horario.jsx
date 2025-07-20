import { useState } from "react";
import HorarioDia from "./HorarioDia";
import HorarioSemana from "./HorarioSemana";
import HorarioMes from "./HorarioMes";
import { Box, Typography, Button } from "@mui/material";

export default function Clases() {
  const [active, setActive] = useState("dia");
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {active === "dia" && "Horario diario"}
        {active === "semanal" && "Horario semanal"}
        {active === "mes" && "Horario mensual"}
      </Typography>

      <Box display={"flex"} alignItems="left" gap={1} mb={2}>
        <Button
          onClick={() => setActive("dia")}
          variant="outlined"
          sx={{ color: "#ffffff", borderColor: "#ffffff", height: "fit-content" }}
        >
          Por día
        </Button>

        <Button
          onClick={() => setActive("semanal")}
          variant="outlined"
          sx={{ color: "#ffffff", borderColor: "#ffffff", height: "fit-content" }}
        >
          Semanal
        </Button>

        <Button
          onClick={() => setActive("mes")}
          variant="outlined"
          sx={{ color: "#ffffff", borderColor: "#ffffff", height: "fit-content" }}
        >
          Mensual
        </Button>
      </Box>

      {active === "dia" && <HorarioDia />}
      {active === "semanal" && <HorarioSemana />}
      {active === "mes" && <HorarioMes />}
    </Box>
  );
}