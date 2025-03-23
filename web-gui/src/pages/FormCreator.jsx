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
import { toast } from 'react-toastify';
import SendPopap from './Popap';

const FormCreator = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [popapOpen, setPopapOpen] = useState(false);

  const handleCreate = () => {
    if (!title.trim()) {
      toast.error('Введите название формы');
      return;
    }

    const formIdList = JSON.parse(localStorage.getItem('form_id_list') || '[]');
    const newId = formIdList.length > 0 ? Math.max(...formIdList) + 1 : 1;
    
    const newForm = {
      title,
      description,
      questions: []
    };

    localStorage.setItem(`form_${newId}`, JSON.stringify(newForm));
    localStorage.setItem('form_id_list', JSON.stringify([...formIdList, newId]));
    
    navigate(`/form/${newId}`);
    setOpen(false);
  };

  return (
    <Dialog open={open} onClose={() => navigate('/')} fullWidth>
      <DialogTitle>Создание новой формы</DialogTitle>
      <DialogContent>
        <Box sx={{ py: 2 }}>
          <TextField
            fullWidth
            label="Название формы"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Описание формы"
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => navigate('/')}>Отмена</Button>
        <Button onClick={handleCreate} variant="contained" color="primary">
          Создать
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FormCreator;