import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
} from "@mui/material";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  message,
  title = "Confirmar acción",
  confirmText = "Aceptar",
  cancelText = "Cancelar",
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          background: "#222",
          color: "#fff",
          borderRadius: 3,
          boxShadow: 8,
          minWidth: 350,
        },
      }}
    >
      <DialogTitle
        sx={{ display: "flex", alignItems: "center", gap: 1, fontWeight: 600 }}
      >
        <WarningAmberRoundedIcon sx={{ color: "#ff9800" }} />
        {title}
      </DialogTitle>
      <DialogContent>
        <Typography>{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ color: "#aaa" }}>
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          sx={{ background: "#2196f3" }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmDialog;
