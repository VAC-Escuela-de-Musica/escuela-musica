import React from "react";
import { FixedSizeList } from "react-window";
import { Box, Typography, Button } from "@mui/material";

const ListaEstudiantes = ({ lista, titulo, onItemClick, textoBoton, colorBoton }) => {
  return (
    <Box flex={1}>
      <Typography variant="h6" sx={{ color: "white", mb: 1 }}>
        {titulo}
      </Typography>
      <FixedSizeList
        height={200}
        width="100%"
        itemSize={60}
        itemCount={lista.length}
        style={{ backgroundColor: "#333", color: "white", borderRadius: 4 }}
      >
        {({ index, style }) => {
          const estudiante = lista[index];
          return (
            <Box
              style={style}
              px={2}
              py={1}
              borderBottom="1px solid #444"
              display="flex"
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box>
                <Typography sx={{ fontWeight: "bold" }}>
                  {estudiante.nombreAlumno}
                </Typography>
                <Typography variant="body2">
                  {estudiante.rutAlumno}
                </Typography>
              </Box>
              {onItemClick && (
                <Button
                  variant="outlined"
                  size="small"
                  sx={{
                    color: colorBoton || "white",
                    borderColor: colorBoton || "white",
                    "&:hover": {
                      backgroundColor: colorBoton ? `${colorBoton}33` : "#444",
                    }
                  }}
                  onClick={() => onItemClick(estudiante)}
                >
                  {textoBoton}
                </Button>
              )}
            </Box>
          );
        }}
      </FixedSizeList>
    </Box>
  );
};

export default ListaEstudiantes;