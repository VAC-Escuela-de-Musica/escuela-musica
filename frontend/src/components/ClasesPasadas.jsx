import React from 'react';
import { Button, Box, Typography } from '@mui/material';
import { ArrowCircleLeftOutlined } from '@mui/icons-material';

const clasesPasadas = ({ setActiveModule }) => {
    return (
        <Box sx={{ color: "white" }}>
            <Button 
                variant="outlined" 
                sx={{ borderColor: "#ffffff", color: "#ffffff" }}
                startIcon={<ArrowCircleLeftOutlined />}
                onClick={() => setActiveModule("clases")}
            >
                Volver a Clases
            </Button>

            <Typography variant="h4" gutterBottom marginTop={2}>
                Clases Pasadas
            </Typography>

            {/* Aquí va tu contenido */}

            
        </Box>
    );
};

export default clasesPasadas;