// Modal de error reutilizable
import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, IconButton } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

function ErrorDialog({ open, error, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { minWidth: 340, maxWidth: 400, border: "2px solid #1976d2", borderRadius: 2, boxShadow: "0 8px 32px rgba(0,0,0,0.18)", background: "#fff", pt: 2 } }}>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, pb: 0 }}>
        <ErrorOutlineIcon color="error" sx={{ fontSize: 32 }} />
        <span style={{ fontWeight: 500, fontSize: "1.1rem", color: "#1976d2" }}>Error</span>
        <Box sx={{ flex: 1 }} />
        <IconButton onClick={onClose} size="small">
          <span style={{ fontWeight: "bold", fontSize: 18, color: "#1976d2" }}>×</span>
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ textAlign: "center", py: 2 }}>
        <Typography sx={{ color: "#222", fontSize: "1.05rem" }}>{error}</Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
        <Button onClick={onClose} variant="contained" color="primary" autoFocus>Aceptar</Button>
      </DialogActions>
    </Dialog>
  );
}

export default ErrorDialog;
