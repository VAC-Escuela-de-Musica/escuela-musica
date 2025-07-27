import React from 'react'
import { Box, Paper, Typography, Avatar } from '@mui/material'
import LockIcon from '@mui/icons-material/Lock'

const UnauthorizedAccess = ({ 
  title = "Acceso No Autorizado",
  message = "No tienes permisos para acceder a este módulo.",
  suggestion = "Si necesitas acceso, contacta al administrador.",
  icon = <LockIcon fontSize="large" />,
  color = "warning"
}) => {
  return (
    <Box sx={{ 
      p: 3, 
      minHeight: '60vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <Paper elevation={3} sx={{ 
        p: 6, 
        textAlign: 'center', 
        maxWidth: 500 
      }}>
        <Avatar sx={{ 
          bgcolor: `${color}.main`, 
          mx: 'auto', 
          mb: 2, 
          width: 56, 
          height: 56 
        }}>
          {icon}
        </Avatar>
        <Typography 
          variant="h5" 
          color={`${color}.main`} 
          gutterBottom 
          fontWeight="bold"
        >
          {title}
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary" 
          sx={{ mb: 3 }}
        >
          {message}
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary"
        >
          {suggestion}
        </Typography>
      </Paper>
    </Box>
  )
}

export default UnauthorizedAccess