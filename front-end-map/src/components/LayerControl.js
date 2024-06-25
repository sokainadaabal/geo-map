import React from 'react';
import { FormGroup, FormControlLabel, Switch } from '@mui/material';

const LayerControl = ({ visibility, onToggle }) => {
  return (
    <FormGroup row>
      <FormControlLabel
        control={<Switch checked={visibility.provinces} onChange={() => onToggle('provinces')} />}
        label="Provinces"
      />
      <FormControlLabel
        control={<Switch checked={visibility.regions} onChange={() => onToggle('regions')} />}
        label="Régions"
      />
      <FormControlLabel
        control={<Switch checked={visibility.stations} onChange={() => onToggle('stations')} />}
        label="Stations"
      />
    </FormGroup>
  );
};

export default LayerControl;