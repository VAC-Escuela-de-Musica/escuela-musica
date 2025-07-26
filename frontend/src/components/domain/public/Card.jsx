import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import CardActionArea from "@mui/material/CardActionArea";

export default function ActionAreaCard({ image, title, description }) {
  return (
    <Card 
      sx={{ 
        maxWidth: { xs: 280, md: 320 },
        width: "100%",
        textAlign: "center", 
        padding: 2,
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
        borderRadius: 4,
        backgroundColor: "rgba(34, 34, 34, 0.95)",
        color: "#fff",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        transition: "all 0.3s ease-in-out",
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: "0 12px 40px rgba(0, 0, 0, 0.4)",
          backgroundColor: "rgba(34, 34, 34, 1)",
        }
      }}
    >
      <CardActionArea sx={{ padding: 2 }}>
        <CardMedia
          component="img"
          image={image}
          alt={title}
          sx={{ 
            width: "80px", 
            height: "80px",
            margin: "auto", 
            mb: 2,
            objectFit: "contain",
            filter: "brightness(0) invert(1)",
            opacity: 0.9
          }}
        />
        <CardContent sx={{ px: 2, py: 1 }}>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              fontWeight: "bold", 
              mb: 2,
              fontSize: { xs: "1.1rem", md: "1.25rem" },
              color: "#fff"
            }}
          >
            {title}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: "rgba(255, 255, 255, 0.85)",
              lineHeight: 1.6,
              fontSize: { xs: "0.875rem", md: "0.9rem" }
            }}
          >
            {description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}