import React, { useState } from 'react';
import { Paper, TextField, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

const Filters = ({ onFilter }) => {
  const [region, setRegion] = useState('');
  const [radius, setRadius] = useState('');
  const [center, setCenter] = useState('');

  const handleFilter = () => {
    onFilter({ region, radius, center });
  };

  return (
    <Paper elevation={3} style={{ padding: '20px', marginBottom: '20px' }}>
      <FormControl fullWidth style={{ marginBottom: '10px' }}>
        <InputLabel>Région</InputLabel>
        <Select value={region} onChange={(e) => setRegion(e.target.value)}>
          <MenuItem value="">Toutes les régions</MenuItem>
          <MenuItem value="Tanger-Tétouan-Al Hoceïma">Tanger-Tétouan-Al Hoceïma</MenuItem>
          <MenuItem value="l'Oriental">l'Oriental</MenuItem>
          <MenuItem value="Fès-Meknès">Fès-Meknès</MenuItem>
          <MenuItem value="Rabat-Salé-Kénitra">Rabat-Salé-Kénitra</MenuItem>
          <MenuItem value="Béni Mellal-Khénifra">Béni Mellal-Khénifra</MenuItem>
          <MenuItem value="Casablanca-Settat">Casablanca-Settat</MenuItem>
          <MenuItem value="Marrakech-Safi">Marrakech-Safi</MenuItem>
          <MenuItem value="Drâa-Tafilalet">Drâa-Tafilalet</MenuItem>
          <MenuItem value="Souss-Massa">Souss-Massa</MenuItem>
          <MenuItem value="Guelmim-Oued Noun">Guelmim-Oued Noun</MenuItem>
          <MenuItem value="Laâyoune-Sakia El Hamra">Laâyoune-Sakia El Hamra</MenuItem>
          <MenuItem value="Dakhla-Oued Ed-Dahab">Dakhla-Oued Ed-Dahab</MenuItem>
        </Select>
      </FormControl>
      <TextField
        fullWidth
        label="Rayon de recherche (km)"
        value={radius}
        onChange={(e) => setRadius(e.target.value)}
        style={{ marginBottom: '10px' }}
      />
      <TextField
        fullWidth
        label="Centre de recherche (lat, lon)"
        value={center}
        onChange={(e) => setCenter(e.target.value)}
        style={{ marginBottom: '10px' }}
      />
      <Button variant="contained" color="primary" onClick={handleFilter}>
        Appliquer les filtres
      </Button>
    </Paper>
  );
};

export default Filters;