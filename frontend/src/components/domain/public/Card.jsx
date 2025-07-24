import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';

export default function ActionAreaCard({ image, title, description }) {
  return (
    <Card 
      sx={{ 
        maxWidth: 300, 
        textAlign: 'center', 
        paddingY: 2,
        boxShadow: 3,
        borderRadius: 3,
        margin: '0 10px',
        backgroundColor: '#222222',
        color: '#fff',
      }}
    >
      <CardActionArea>
        <CardMedia
          component="img"
          height="100"
          image={image}
          alt={title}
          sx={{ objectFit: 'contain', width: '80px', margin: 'auto', pt: 2 }}
        />
        <CardContent>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            {title}
          </Typography>
          <Typography variant="body2" sx={{ color: '#fff' }}>
            {description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}