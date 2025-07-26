import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  Alert,
  Divider
} from '@mui/material';
import { 
  Error as ErrorIcon, 
  Refresh as RefreshIcon,
  BugReport as BugIcon 
} from '@mui/icons-material';

/**
 * ErrorBoundary mejorado para captura centralizada de errores
 * Parte de la Capa 1 (Base) de la arquitectura
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Genera un ID único para el error
    const errorId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    return { 
      hasError: true,
      errorId 
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log del error para debugging
    console.error('ErrorBoundary capturó un error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Reportar error si hay función de reporte
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Enviar error al servicio de logging si está configurado
    if (window.errorLogger) {
      window.errorLogger.logError(error, errorInfo, this.state.errorId);
    }
  }

  handleReload = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null 
    });
    
    // Callback para recargar específico del componente
    if (this.props.onReload) {
      this.props.onReload();
    } else {
      // Recarga de página como fallback
      window.location.reload();
    }
  };

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null 
    });

    // Ejecutar función de retry específica
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      // Componente de error personalizado si se proporciona
      if (this.props.fallback) {
        return this.props.fallback(
          this.state.error, 
          this.state.errorInfo, 
          this.handleRetry
        );
      }

      // UI de error por defecto
      return (
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          minHeight="400px"
          p={3}
        >
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              maxWidth: 600, 
              textAlign: 'center',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca'
            }}
          >
            {/* Icono de error */}
            <Box mb={3}>
              <ErrorIcon 
                sx={{ 
                  fontSize: 64, 
                  color: 'error.main',
                  mb: 2 
                }} 
              />
              <Typography variant="h4" color="error.main" gutterBottom>
                ¡Oops! Algo salió mal
              </Typography>
            </Box>

            {/* Mensaje de error amigable */}
            <Typography variant="body1" color="text.secondary" paragraph>
              {this.props.userMessage || 
               'Ha ocurrido un error inesperado. Nuestro equipo ha sido notificado automáticamente.'}
            </Typography>

            {/* ID del error para soporte */}
            {this.state.errorId && (
              <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
                <Typography variant="body2">
                  <strong>ID del error:</strong> {this.state.errorId}
                  <br />
                  <em>Incluye este ID si contactas al soporte técnico.</em>
                </Typography>
              </Alert>
            )}

            {/* Botones de acción */}
            <Box display="flex" gap={2} justifyContent="center" mb={3}>
              {this.props.onRetry && (
                <Button
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  onClick={this.handleRetry}
                  color="primary"
                >
                  Reintentar
                </Button>
              )}
              
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={this.handleReload}
                color="primary"
              >
                Recargar Página
              </Button>
            </Box>

            {/* Detalles técnicos en desarrollo */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <>
                <Divider sx={{ my: 3 }} />
                <Box textAlign="left">
                  <Typography variant="h6" color="error" gutterBottom>
                    <BugIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Detalles Técnicos (Solo en Desarrollo)
                  </Typography>
                  
                  <Alert severity="error" sx={{ mb: 2 }}>
                    <Typography variant="body2" component="pre" sx={{ fontSize: '0.75rem' }}>
                      <strong>Error:</strong> {this.state.error.toString()}
                    </Typography>
                  </Alert>

                  {this.state.errorInfo && (
                    <Alert severity="warning">
                      <Typography variant="body2" component="pre" sx={{ fontSize: '0.75rem' }}>
                        <strong>Stack Trace:</strong>
                        {this.state.errorInfo.componentStack}
                      </Typography>
                    </Alert>
                  )}
                </Box>
              </>
            )}

            {/* Link de contacto si se proporciona */}
            {this.props.contactInfo && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                ¿Necesitas ayuda? {this.props.contactInfo}
              </Typography>
            )}
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;