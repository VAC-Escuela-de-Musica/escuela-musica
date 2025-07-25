import React, { Suspense } from "react";
import { Box, Typography, Divider, CircularProgress } from "@mui/material";

const WhatsAppConfig = React.lazy(() => import("./WhatsAppConfig"));
const EmailConfig = React.lazy(() => import("./EmailConfig"));
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
        Gestión de Mensajería
      </Typography>
      <Divider sx={{ mb: 3, borderColor: '#444444' }} />
      
      {/* Mensajes Internos */}
      <Typography variant="h5" sx={{ mb: 2, color: '#2196F3', fontWeight: 'bold' }}>
        📨 Mensajes Internos
      </Typography>
      <Typography variant="body1" sx={{ mb: 3, color: '#cccccc' }}>
        Envía mensajes y notificaciones directamente a los estudiantes de la escuela
      </Typography>
      <Suspense fallback={<MessagingLoadingFallback message="Cargando Mensajes Internos..." />}>
        <InternalMessageManager />
      </Suspense>
      
      <Divider sx={{ my: 4, borderColor: '#444444' }} />
      
      {/* WhatsApp */}
      <Typography variant="h5" sx={{ mb: 2, color: '#25D366', fontWeight: 'bold' }}>
        📱 Configuración WhatsApp
      </Typography>
      <Typography variant="body1" sx={{ mb: 3, color: '#cccccc' }}>
        Configura la integración con WhatsApp Business para envío de mensajes
      </Typography>
      <Suspense fallback={<MessagingLoadingFallback message="Cargando WhatsApp..." />}>
        <WhatsAppConfig />
      </Suspense>
      
      <Divider sx={{ my: 4, borderColor: '#444444' }} />
      
      {/* Email */}
      <Typography variant="h5" sx={{ mb: 2, color: '#EA4335', fontWeight: 'bold' }}>
        📧 Configuración Email
      </Typography>
      <Typography variant="body1" sx={{ mb: 3, color: '#cccccc' }}>
        Configura el servidor de correo electrónico para envío de emails
      </Typography>
      <Suspense fallback={<MessagingLoadingFallback message="Cargando Email..." />}>
        <EmailConfig />
      </Suspense>
    </Box>
  );
};

export default MensajeriaManager;
