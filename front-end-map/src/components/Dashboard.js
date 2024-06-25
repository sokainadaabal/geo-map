import React from 'react';
import { Paper, Typography } from '@mui/material';

const Dashboard = ({ data }) => {
  return (
    <Paper elevation={3} style={{ padding: '20px' }}>
      <Typography variant="h5">Dashboard</Typography>
      {data && (
        <div>
          <Typography>Région sélectionnée: {data.region || 'Aucune'}</Typography>
          <Typography>Rayon de recherche: {data.radius || 'Non spécifié'} km</Typography>
          <Typography>Centre de recherche: {data.center || 'Non spécifié'}</Typography>
        </div>
      )}
      {/* Ajoutez ici vos graphiques et visualisations */}
    </Paper>
  );
};

export default Dashboard;