import React, { Suspense } from "react";
import { Box, Typography, Divider, CircularProgress } from "@mui/material";

const WhatsAppConfig = React.lazy(() => import("./WhatsAppConfig"));
const EmailConfig = React.lazy(() => import("./EmailConfig"));

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
        Gestión de Mensajería
      </Typography>
      <Divider sx={{ mb: 3, borderColor: '#444444' }} />
      <Suspense fallback={<MessagingLoadingFallback message="Cargando WhatsApp..." />}>
        <WhatsAppConfig />
      </Suspense>
      <Divider sx={{ my: 3, borderColor: '#444444' }} />
      <Suspense fallback={<MessagingLoadingFallback message="Cargando Email..." />}>
        <EmailConfig />
      </Suspense>
    </Box>
  );
};

export default MensajeriaManager;
