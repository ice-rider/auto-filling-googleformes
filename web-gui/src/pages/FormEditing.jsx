// FormEditor.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Radio,
  RadioGroup,
  FormControlLabel,
  IconButton,
  Card,
  CardContent,
  Typography
} from '@mui/material';
import { 
  Add, 
  Delete, 
  ContentCopy, 
  Save, 
  Home, 
  Send, 
  RadioButtonUnchecked,
  CheckBoxOutlineBlank,
  ArrowDropDown
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';
import SendPopap from './Popap';

export default function FormEditor() {
  const { form_id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedType, setSelectedType] = useState('radio');
  const [isPopapOpen, setPopapOpen] = useState(false);
  const [testPopapOpen, setTestPopapOpen] = useState(false);

  const questionTypes = [
    { label: 'Один вариант', value: 'radio' },
    { label: 'Несколько вариантов', value: 'checkbox' },
    { label: 'Выпадающий список', value: 'select' },
  ];

  useEffect(() => {
    const loadForm = () => {
      const storedForm = localStorage.getItem(`form_${form_id}`);
      if (!storedForm) {
        toast.error('Форма не найдена');
        return;
      }
      setFormData(JSON.parse(storedForm));
    };

    loadForm();
  }, [form_id]);

  const sendForSolution = (form_url, N) => {
    fetch('/api/prod', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...formData,
        form_url,
        N
      })
    }).then(response => {
      response.json().then(data => {
        toast.success('Запуск окна с отправкой...');
      }).catch(error => {
        toast.error('Произошла ошибка при отправке формы: ' + error);
      })
    })
  }

  const sendTryTest = (form_url) => {
    fetch('/api/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...formData,
        form_url
      })
    })
      .then(response => response.json())
      .then(data => {
        toast.success('Тест отправлен');
        console.log(data);
      })
      .catch(error => {
        toast.error('Произошла ошибка при отправке теста');
      })
  }

  const addQuestion = () => {
    const newQuestion = {
      id: uuidv4(),
      type: selectedType,
      question: '',
      options: [{ 
        id: uuidv4(), 
        text: '', 
        chance: 0.5 
      }]
    };
    
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
    setOpenDialog(false);
  };

  const handleQuestionChange = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === id ? { ...q, [field]: value } : q
      )
    }));
  };

  const handleOptionChange = (questionId, optionId, field, value) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId) {
          return {
            ...q,
            options: q.options.map(opt => 
              opt.id === optionId ? { ...opt, [field]: value } : opt
            )
          };
        }
        return q;
      })
    }));
  };

  const addOption = (questionId) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId) {
          return {
            ...q,
            options: [...q.options, { 
              id: uuidv4(),
              text: '',
              chance: 0.5
            }]
          };
        }
        return q;
      })
    }));
  };

  const deleteOption = (questionId, optionId) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId) {
          return {
            ...q,
            options: q.options.filter(opt => opt.id !== optionId)
          };
        }
        return q;
      })
    }));
  };

  const duplicateQuestion = (questionId) => {
    const question = formData.questions.find(q => q.id === questionId);
    const newQuestion = {
      ...question,
      id: uuidv4(),
      options: question.options.map(opt => ({
        ...opt,
        id: uuidv4()
      }))
    };
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const deleteQuestion = (questionId) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
  };

  const handleSave = () => {
    localStorage.setItem(`form_${form_id}`, JSON.stringify(formData));
    toast.success('Форма успешно сохранена');
  };

  if (!formData) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Форма с ID {form_id} не найдена
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          На главную
        </Button>
      </Box>
    );
  }

  return (
    <>
      <SendPopap open={isPopapOpen} setOpen={setPopapOpen} onSend={sendForSolution} />
      <SendPopap open={testPopapOpen} setOpen={setTestPopapOpen} onSend={sendTryTest} test={true}/>
      <Box sx={{ maxWidth: 800, margin: 'auto', p: 2 }}>
        <Card sx={{ mb: 2, borderRadius: 2 }}>
          <CardContent>
            <TextField
              fullWidth
              label="Название формы"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Описание формы"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
            />
          </CardContent>
        </Card>

        <Divider sx={{ my: 3 }} />

        {formData.questions.map((question) => (
          <Card key={question.id} sx={{ mb: 2, borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                  <Typography variant="h6">Вопрос</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Тип: {questionTypes.find(t => t.value === question.type)?.label}
                  </Typography>
                </Box>
                <Box>
                  <IconButton onClick={() => duplicateQuestion(question.id)}>
                    <ContentCopy />
                  </IconButton>
                  <IconButton onClick={() => deleteQuestion(question.id)}>
                    <Delete />
                  </IconButton>
                </Box>
              </Box>

              <TextField
                fullWidth
                label="Текст вопроса"
                value={question.question}
                onChange={(e) => handleQuestionChange(question.id, 'question', e.target.value)}
                sx={{ mb: 2 }}
              />

              {question.options.map((option) => (
                <Box 
                  key={option.id} 
                  sx={{ 
                    display: 'flex', 
                    gap: 2, 
                    mb: 1,
                    alignItems: 'center',
                    pl: 1
                  }}
                >
                  {question.type === 'radio' && <RadioButtonUnchecked sx={{ color: 'action.active' }} />}
                  {question.type === 'checkbox' && <CheckBoxOutlineBlank sx={{ color: 'action.active' }} />}
                  {question.type === 'select' && <ArrowDropDown sx={{ color: 'action.active' }} />}

                  <TextField
                    fullWidth
                    label="Вариант ответа"
                    value={option.text}
                    onChange={(e) => handleOptionChange(
                      question.id, 
                      option.id, 
                      'text', 
                      e.target.value
                    )}
                  />
                  <TextField
                    type="number"
                    label="Шанс выбора"
                    inputProps={{ min: 0, max: 1, step: 0.1 }}
                    value={option.chance}
                    onChange={(e) => handleOptionChange(
                      question.id, 
                      option.id, 
                      'chance', 
                      Math.max(0, Math.min(1, parseFloat(e.target.value || 0)))
                  )}
                    sx={{ width: 200 }}
                  />
                  <IconButton 
                    onClick={() => deleteOption(question.id, option.id)}
                    disabled={question.options.length === 1}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              ))}

              <Button 
                onClick={() => addOption(question.id)}
                startIcon={<Add />}
                sx={{ mt: 1 }}
              >
                Добавить вариант
              </Button>
            </CardContent>
          </Card>
        ))}

        <Box sx={{ display: 'flex', flexDirection: 'column', position: 'relative',  width: '100%', gap: 2, mt: 3 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenDialog(true)}
            >
              Добавить вопрос
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<Save />}
              onClick={handleSave}
            >
              Сохранить форму
            </Button>
            <Button
              variant="outlined"
              startIcon={<Home />}
              onClick={() => navigate('/')}
            >
              На главную
            </Button>
          </div>
          <div>
            <br /><Divider /><br />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              startIcon={<Send />}
              onClick={() => {setTestPopapOpen(true);}}
            >
              Тест заполнения формы (1 раз без отправки)
            </Button>
            <Button
              variant="contained"
              startIcon={<Send />}
              onClick={() => {setPopapOpen(true);}}
            >
              Отправка формы N раз
            </Button>
          </div>
        </Box>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Выберите тип вопроса</DialogTitle>
          <DialogContent>
            <RadioGroup
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              {questionTypes.map((type) => (
                <FormControlLabel
                  key={type.value}
                  value={type.value}
                  control={<Radio />}
                  label={type.label}
                />
              ))}
            </RadioGroup>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
            <Button onClick={addQuestion} variant="contained">Добавить</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};