import React, { useState } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
} from "@mui/material";
import {
  Schedule as ScheduleIcon,
  School as SchoolIcon,
  Add as AddIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";

// Importar los módulos existentes
import Horario from "./Horario.jsx";
import Clases from "../clases/Clases.jsx";
import ClasesCrear from "../clases/ClasesCrear.jsx";
import ClasesCanceladas from "../clases/ClasesCanceladas.jsx";

// Custom TabPanel component
function CustomTabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`horario-tabpanel-${index}`}
      aria-labelledby={`horario-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Accessibility props for tabs
function a11yProps(index) {
  return {
    id: `horario-tab-${index}`,
    'aria-controls': `horario-tabpanel-${index}`,
  };
}

const HorarioConClases = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ p: 3, backgroundColor: "#222222", minHeight: "100vh", color: "white" }}>
      {/* Header */}
      <Typography 
        variant="h4" 
        component="h1" 
        sx={{ 
          color: "#2196F3", 
          fontWeight: "bold", 
          mb: 3,
          display: "flex",
          alignItems: "center",
          gap: 1
        }}
      >
        <ScheduleIcon sx={{ fontSize: "inherit" }} />
        Gestión de Horarios y Clases
      </Typography>

      {/* Tabs Navigation */}
      <Paper 
        elevation={3}
        sx={{ 
          backgroundColor: "#333333",
          borderRadius: 2,
          mb: 2
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="horario y clases tabs"
            sx={{
              "& .MuiTab-root": {
                color: "#ffffff",
                textTransform: "none",
                fontWeight: "bold",
                fontSize: "1rem",
                minHeight: 64,
              },
              "& .MuiTab-root.Mui-selected": {
                color: "#2196F3",
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "#2196F3",
                height: 3,
              },
            }}
          >
            <Tab 
              icon={<ScheduleIcon />} 
              label="Horarios" 
              iconPosition="start"
              {...a11yProps(0)} 
            />
            <Tab 
              icon={<SchoolIcon />} 
              label="Gestionar Clases" 
              iconPosition="start"
              {...a11yProps(1)} 
            />
            <Tab 
              icon={<AddIcon />} 
              label="Nueva Clase" 
              iconPosition="start"
              {...a11yProps(2)} 
            />
            <Tab 
              icon={<CancelIcon />} 
              label="Clases Canceladas" 
              iconPosition="start"
              {...a11yProps(3)} 
            />
          </Tabs>
        </Box>
      </Paper>

      {/* Tab Panels */}
      <Box sx={{ backgroundColor: "#333333", borderRadius: 2, minHeight: "400px" }}>
        <CustomTabPanel value={tabValue} index={0}>
          <Horario />
        </CustomTabPanel>
        
        <CustomTabPanel value={tabValue} index={1}>
          <Clases />
        </CustomTabPanel>
        
        <CustomTabPanel value={tabValue} index={2}>
          <ClasesCrear />
        </CustomTabPanel>
        
        <CustomTabPanel value={tabValue} index={3}>
          <ClasesCanceladas />
        </CustomTabPanel>
      </Box>
    </Box>
  );
};

export default HorarioConClases; 