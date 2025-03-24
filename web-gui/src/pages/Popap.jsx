// CreateFormDialog.jsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function SendPopap({ open, setOpen, onSend, test=false }) {
  const navigate = useNavigate();
  const [n, setN] = useState(1);
  const [url, setUrl] = useState('');

  const handleCreate = () => {
    onSend(url, n);
    setOpen(false);
  };

  return (
    <Dialog open={open} onClose={() => navigate('/')} fullWidth>
      <DialogTitle>Отправка форм</DialogTitle>
      <DialogContent>
        <Box sx={{ py: 2 }}>
          <TextField
            fullWidth
            label="введите N"
            value={n}
            disabled={test}
            onChange={(e) => setN(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="введите юрл формы"
            multiline
            rows={3}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)}>Отмена</Button>
        <Button onClick={handleCreate} variant="contained" color="primary">
          Отправить
        </Button>
      </DialogActions>
    </Dialog>
  );
};
