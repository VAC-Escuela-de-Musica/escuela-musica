import { useState } from "react";
import HorarioDia from "./HorarioDia";
import HorarioSemana from "./HorarioSemana";
import HorarioMes from "./HorarioMes";
import HorarioCalendar from "./HorarioCalendar";
import { Box, Typography, Button, ToggleButton, ToggleButtonGroup, Divider } from "@mui/material";
import { CalendarMonth, List } from "@mui/icons-material";

export default function Clases() {
  const [active, setActive] = useState("dia");
  const [viewMode, setViewMode] = useState("calendar"); // "calendar" o "list"
  
  const handleViewModeChange = (event, newViewMode) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Vista de calendario (nueva) */}
      {viewMode === "calendar" && (
        <HorarioCalendar 
          viewMode={viewMode}
          handleViewModeChange={handleViewModeChange}
        />
      )}

      {/* Vista de lista (original) */}
      {viewMode === "list" && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h4" gutterBottom sx={{ color: "#2196F3" }}>
              {active === "dia" && "📅 Horario diario"}
              {active === "semanal" && "📅 Horario semanal"}
              {active === "mes" && "📅 Horario mensual"}
            </Typography>

            <Box display="flex" gap={2} alignItems="center">
              {/* Toggle Calendario/Lista para vista lista */}
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={handleViewModeChange}
                aria-label="modo de vista"
                size="small"
                sx={{
                  backgroundColor: "rgba(68, 68, 68, 0.8)",
                  borderRadius: 2,
                  "& .MuiToggleButton-root": {
                    color: "#ffffff",
                    border: "1px solid rgba(102, 102, 102, 0.5)",
                    fontSize: "0.7rem",
                    padding: "4px 8px",
                    fontWeight: "500",
                    "&.Mui-selected": {
                      backgroundColor: "#2196F3",
                      color: "#ffffff",
                      "&:hover": {
                        backgroundColor: "#1976D2",
                      }
                    },
                    "&:hover": {
                      backgroundColor: "rgba(85, 85, 85, 0.8)",
                    }
                  }
                }}
              >
                <ToggleButton value="calendar" aria-label="vista calendario">
                  <CalendarMonth sx={{ fontSize: "1rem" }} />
                </ToggleButton>
                <ToggleButton value="list" aria-label="vista lista">
                  <List sx={{ fontSize: "1rem" }} />
                </ToggleButton>
              </ToggleButtonGroup>

              <Box display="flex" gap={1}>
              <Button
                disabled={active === "dia"}
                onClick={() => setActive("dia")}
                variant="outlined"
                sx={{ 
                  color: active === "dia" ? "#666666" : "#ffffff", 
                  borderColor: active === "dia" ? "#666666" : "#2196F3",
                  "&:hover": {
                    borderColor: "#2196F3",
                    backgroundColor: "rgba(33, 150, 243, 0.1)"
                  }
                }}
              >
                Por día
              </Button>

              <Button
                disabled={active === "semanal"}
                onClick={() => setActive("semanal")}
                variant="outlined"
                sx={{ 
                  color: active === "semanal" ? "#666666" : "#ffffff", 
                  borderColor: active === "semanal" ? "#666666" : "#2196F3",
                  "&:hover": {
                    borderColor: "#2196F3",
                    backgroundColor: "rgba(33, 150, 243, 0.1)"
                  }
                }}
              >
                Semanal
              </Button>

              <Button
                disabled={active === "mes"}
                onClick={() => setActive("mes")}
                variant="outlined"
                sx={{ 
                  color: active === "mes" ? "#666666" : "#ffffff", 
                  borderColor: active === "mes" ? "#666666" : "#2196F3",
                  "&:hover": {
                    borderColor: "#2196F3",
                    backgroundColor: "rgba(33, 150, 243, 0.1)"
                  }
                }}
              >
                Mensual
              </Button>
              </Box>
            </Box>
          </Box>

          {active === "dia" && <HorarioDia />}
          {active === "semanal" && <HorarioSemana />}
          {active === "mes" && <HorarioMes />}
        </Box>
      )}
    </Box>
  );
}