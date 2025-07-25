import React, { useState } from 'react';
import {
  IconButton,
  Switch,
  Chip,
  Tooltip,
  Box,
  Typography,
  CircularProgress,
  FormControlLabel,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  PlayArrow as EnableIcon,
  Pause as DisableIcon,
  Lock as LockedIcon,
  LockOpen as UnlockedIcon
} from '@mui/icons-material';

/**
 * Componente configurable para toggle de estado - Capa 2
 * Soporta múltiples variantes visuales y tipos de estado
 * Completamente reutilizable en diferentes dominios
 */
const StatusToggle = ({
  value = false,
  onChange = null,
  variant = "switch", // "switch" | "icon" | "chip" | "button"
  type = "visibility", // "visibility" | "active" | "enabled" | "locked"
  size = "medium", // "small" | "medium" | "large"
  color = "primary",
  disabled = false,
  loading = false,
  showLabel = false,
  labels = null, // { true: "Activo", false: "Inactivo" }
  icons = null, // { true: <CustomIcon />, false: <CustomIcon /> }
  confirmChange = false,
  confirmMessage = "¿Confirmar cambio de estado?",
  tooltip = true,
  className = "",
  sx = {}
}) => {
  const [isLoading, setIsLoading] = useState(false);

  // Configuraciones predefinidas por tipo
  const typeConfigs = {
    visibility: {
      trueIcon: <VisibilityIcon />,
      falseIcon: <VisibilityOffIcon />,
      trueLabel: "Visible",
      falseLabel: "Oculto",
      trueTooltip: "Elemento visible",
      falseTooltip: "Elemento oculto",
      trueColor: "success",
      falseColor: "default"
    },
    active: {
      trueIcon: <ActiveIcon />,
      falseIcon: <InactiveIcon />,
      trueLabel: "Activo",
      falseLabel: "Inactivo",
      trueTooltip: "Elemento activo",
      falseTooltip: "Elemento inactivo",
      trueColor: "success",
      falseColor: "error"
    },
    enabled: {
      trueIcon: <EnableIcon />,
      falseIcon: <DisableIcon />,
      trueLabel: "Habilitado",
      falseLabel: "Deshabilitado",
      trueTooltip: "Elemento habilitado",
      falseTooltip: "Elemento deshabilitado",
      trueColor: "primary",
      falseColor: "default"
    },
    locked: {
      trueIcon: <LockedIcon />,
      falseIcon: <UnlockedIcon />,
      trueLabel: "Bloqueado",
      falseLabel: "Desbloqueado",
      trueTooltip: "Elemento bloqueado",
      falseTooltip: "Elemento desbloqueado",
      trueColor: "error",
      falseColor: "success"
    }
  };

  const config = typeConfigs[type];
  const currentIcon = icons?.[value] || (value ? config.trueIcon : config.falseIcon);
  const currentLabel = labels?.[value] || (value ? config.trueLabel : config.falseLabel);
  const currentTooltip = value ? config.trueTooltip : config.falseTooltip;
  const currentColor = value ? config.trueColor : config.falseColor;

  // Manejo del cambio de estado
  const handleChange = async (newValue) => {
    if (disabled || loading || isLoading) return;

    // Confirmación si está habilitada
    if (confirmChange) {
      const confirmed = window.confirm(confirmMessage);
      if (!confirmed) return;
    }

    try {
      setIsLoading(true);
      
      if (onChange) {
        await onChange(newValue);
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Componente de carga
  const LoadingComponent = () => (
    <CircularProgress 
      size={size === "small" ? 16 : size === "large" ? 28 : 20} 
      thickness={4}
    />
  );

  // Wrapper con tooltip
  const withTooltip = (component) => {
    if (!tooltip || disabled) return component;
    
    return (
      <Tooltip title={currentTooltip} arrow>
        {component}
      </Tooltip>
    );
  };

  // Renderizar según variante
  const renderVariant = () => {
    const isCurrentlyLoading = loading || isLoading;

    switch (variant) {
      case "icon":
        return withTooltip(
          <IconButton
            size={size}
            color={currentColor}
            disabled={disabled}
            onClick={() => handleChange(!value)}
            className={className}
            sx={sx}
          >
            {isCurrentlyLoading ? <LoadingComponent /> : currentIcon}
          </IconButton>
        );

      case "chip":
        return withTooltip(
          <Chip
            icon={isCurrentlyLoading ? <LoadingComponent /> : currentIcon}
            label={showLabel ? currentLabel : undefined}
            color={currentColor}
            variant={value ? "filled" : "outlined"}
            size={size}
            disabled={disabled}
            onClick={() => handleChange(!value)}
            clickable={!disabled && !isCurrentlyLoading}
            className={className}
            sx={sx}
          />
        );

      case "button":
        return (
          <ToggleButtonGroup
            value={value}
            exclusive
            onChange={(e, newValue) => newValue !== null && handleChange(newValue)}
            size={size}
            disabled={disabled || isCurrentlyLoading}
            className={className}
            sx={sx}
          >
            <ToggleButton value={false}>
              {isCurrentlyLoading && !value ? <LoadingComponent /> : config.falseIcon}
              {showLabel && (
                <Typography variant="caption" sx={{ ml: 1 }}>
                  {config.falseLabel}
                </Typography>
              )}
            </ToggleButton>
            <ToggleButton value={true}>
              {isCurrentlyLoading && value ? <LoadingComponent /> : config.trueIcon}
              {showLabel && (
                <Typography variant="caption" sx={{ ml: 1 }}>
                  {config.trueLabel}
                </Typography>
              )}
            </ToggleButton>
          </ToggleButtonGroup>
        );

      case "switch":
      default:
        const switchComponent = (
          <Switch
            checked={value}
            onChange={(e) => handleChange(e.target.checked)}
            color={color}
            size={size}
            disabled={disabled || isCurrentlyLoading}
            className={className}
            sx={sx}
          />
        );

        if (showLabel) {
          return (
            <FormControlLabel
              control={switchComponent}
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  {isCurrentlyLoading ? <LoadingComponent /> : currentIcon}
                  <Typography variant="body2">
                    {currentLabel}
                  </Typography>
                </Box>
              }
              disabled={disabled || isCurrentlyLoading}
            />
          );
        }

        return withTooltip(switchComponent);
    }
  };

  return renderVariant();
};

export default StatusToggle;