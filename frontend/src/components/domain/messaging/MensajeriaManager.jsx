import React, { Suspense } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";

const InternalMessageManager = React.lazy(() => import("../../../pages/InternalMessageManager"));

// Professional loading component for messaging
const MessagingLoadingFallback = ({ message }) => (
  <Box 
    sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '200px',
      color: '#ffffff',
      backgroundColor: '#333333',
      borderRadius: 2,
      p: 3
    }}
  >
    <CircularProgress sx={{ color: '#2196F3', mb: 2 }} size={30} />
    <Typography variant="body1" sx={{ color: '#ffffff' }}>
      {message}
    </Typography>
  </Box>
);

const MensajeriaManager = () => {
  return (
    <Box sx={{ p: 3, backgroundColor: '#222222', color: '#ffffff', borderRadius: 3 }}>
      <Typography variant="h4" sx={{ mb: 2, color: '#ffffff', textAlign: 'center', fontWeight: 'bold' }}>
        Mensajería Interna
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3, color: '#cccccc', textAlign: 'center' }}>
        Envía mensajes y notificaciones directamente a los estudiantes de la escuela
      </Typography>
      
      <Suspense fallback={<MessagingLoadingFallback message="Cargando Mensajería Interna..." />}>
        <InternalMessageManager />
      </Suspense>
    </Box>
  );
};

export default MensajeriaManager;
