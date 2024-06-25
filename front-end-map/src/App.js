import React, { useState, useCallback } from 'react';
import { Container, Grid, Paper } from '@mui/material';
import MapComponent from './components/MapComponent';
import Dashboard from './components/Dashboard';
import Filters from './components/Filters';
import LayerControl from './components/LayerControl';

function App() {
  const [filteredData, setFilteredData] = useState(null);
  const [layerVisibility, setLayerVisibility] = useState({
    provinces: true,
    regions: true,
    stations: true,
  });

  const handleFilter = useCallback((filterParams) => {
    setFilteredData(filterParams);
  }, []);

  const handleLayerToggle = useCallback((layer) => {
    setLayerVisibility(prev => ({ ...prev, [layer]: !prev[layer] }));
  }, []);

  return (
    <Container maxWidth="lg" style={{ marginTop: '20px' }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Filters onFilter={handleFilter} />
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} style={{ padding: '20px' }}>
            <LayerControl visibility={layerVisibility} onToggle={handleLayerToggle} />
            <MapComponent filterParams={filteredData} layerVisibility={layerVisibility} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Dashboard data={filteredData} />
        </Grid>
      </Grid>
    </Container>
  );
}

export default App;