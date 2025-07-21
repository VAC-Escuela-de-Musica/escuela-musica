import { useState } from "react";
import HorarioDia from "./HorarioDia";
import HorarioSemana from "./HorarioSemana";
import HorarioMes from "./HorarioMes";
import { Box, Typography, Button } from "@mui/material";

export default function Clases() {
  const [active, setActive] = useState("dia");
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" gutterBottom>
          {active === "dia" && "Horario diario"}
          {active === "semanal" && "Horario semanal"}
          {active === "mes" && "Horario mensual"}
        </Typography>

        <Box display="flex" gap={1}>
          <Button
            disabled={active === "dia"}
            onClick={() => setActive("dia")}
            variant="outlined"
            sx={{ color: "#ffffff", borderColor: "#ffffff", height: "fit-content" }}
          >
            Por día
          </Button>

          <Button
            disabled={active === "semanal"}
            onClick={() => setActive("semanal")}
            variant="outlined"
            sx={{ color: "#ffffff", borderColor: "#ffffff", height: "fit-content" }}
          >
            Semanal
          </Button>

          <Button
            disabled={active === "mes"}
            onClick={() => setActive("mes")}
            variant="outlined"
            sx={{ color: "#ffffff", borderColor: "#ffffff", height: "fit-content" }}
          >
            Mensual
          </Button>
        </Box>
      </Box>

      {active === "dia" && <HorarioDia />}
      {active === "semanal" && <HorarioSemana />}
      {active === "mes" && <HorarioMes />}
    </Box>
  );
}