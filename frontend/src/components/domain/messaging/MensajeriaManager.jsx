import React, { Suspense, useState } from "react";
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Tabs, 
  Tab, 
  Paper 
} from "@mui/material";
import {
  Message as MessageIcon,
  Email as EmailIcon
} from '@mui/icons-material';

const InternalMessageManager = React.lazy(() => import("../../../pages/InternalMessageManager"));
const GmailConfig = React.lazy(() => import("./GmailConfig"));

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
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#222222', color: '#ffffff', borderRadius: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, color: '#ffffff', textAlign: 'center', fontWeight: 'bold' }}>
        📨 Sistema de Mensajería
      </Typography>
      
      <Paper sx={{ backgroundColor: '#333333', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              color: '#ffffff',
              '&.Mui-selected': {
                color: '#2196F3'
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#2196F3'
            }
          }}
        >
          <Tab 
            icon={<MessageIcon />} 
            label="Mensajería Interna" 
            iconPosition="start"
          />
          <Tab 
            icon={<EmailIcon />} 
            label="Configurar Gmail" 
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {activeTab === 0 && (
        <Box>
          <Typography variant="body1" sx={{ mb: 3, color: '#cccccc', textAlign: 'center' }}>
            Envía mensajes y notificaciones directamente a los estudiantes de la escuela
          </Typography>
          
          <Suspense fallback={<MessagingLoadingFallback message="Cargando Mensajería Interna..." />}>
            <InternalMessageManager />
          </Suspense>
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          <Typography variant="body1" sx={{ mb: 3, color: '#cccccc', textAlign: 'center' }}>
            Configura Gmail para enviar mensajes por correo electrónico
          </Typography>
          
          <Suspense fallback={<MessagingLoadingFallback message="Cargando configuración de Gmail..." />}>
            <GmailConfig />
          </Suspense>
        </Box>
      )}
    </Box>
  );
};

export default MensajeriaManager;
