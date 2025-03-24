import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { v4 as uuid } from 'uuid';
import { Button, Divider, Typography, Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton } from "@mui/material"

import "./style.css";


export default function MainMenu() {
    const navigate = useNavigate();
    const [idArray, setIdArray] = useState([]);
    const [open, setOpen] = useState(false);
    const openDialog = () => {
        setOpen(true);
    }

    useEffect(() => {
        if (localStorage.getItem("form_id_list") === null) {
            localStorage.setItem("form_id_list", JSON.stringify([]));
            console.log("created form_id_list");
        }
        console.log(JSON.parse(localStorage.getItem("form_id_list")));
        setIdArray(JSON.parse(localStorage.getItem("form_id_list")));
    }, [localStorage]);
    
    console.log("render: ", idArray, idArray.map((id) => { 
        return <FormButton id={id} onClick={()=>{navigate(`/form/${id}`)}} />
    }));
    return (
        <>
            <div className="container">
                <Typography variant="h3">Список форм:</Typography>
                <Divider />
                { idArray.length > 0
                    ? idArray.map((id) => {
                        return id != 0
                            ? <FormButton id={id} onClick={()=>{navigate(`/form/${id}`)}} /> 
                            : null
                    }) 
                    : <Typography>вы еще не создали ни одной формы</Typography>
                }
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button variant="contained" onClick={()=>{navigate("/form/new")}}>Создать новую форму</Button>
                    <Button variant="outlined"  onClick={openDialog}>Импортировать форму</Button>
                </Box>
            </div>
            <ImportDialog open={open} onClose={() => setOpen(false)} />
        </>
    );
}

function FormButton({ id, onClick }) {
    const [title, setTitle] = useState("FormTitle...");
    const [description, setDescription] = useState("some description");

    useEffect(()=>{
        var data = JSON.parse(localStorage.getItem(`form_${id}`));
        console.log(data);
        setTitle(data.title);
        setDescription(data.description);
    }, [localStorage]);

    return (
        <div className="menu__form_container" onClick={onClick}>
            <div className="menu__form_title">{title}</div>
            <div className="menu__form_description">{description}</div>
        </div>
    )
}

function ImportDialog({ open, onClose }) {
    const [url, setUrl] = useState('');
    const importForm = () => {
        toast.info("Импортируется...");
        fetch("/api/parser", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({url})
        }).then(response => {    
            response.json().then(data => {
                console.log(data);
                const formIdList = JSON.parse(localStorage.getItem('form_id_list')); 
                const id = formIdList.length + 1;
                formIdList.push(id);
                localStorage.setItem(`form_${id}`, data.parsed);
                localStorage.setItem('form_id_list', JSON.stringify(formIdList));
                toast.success('Форма успешно импортирована');
            }).catch(error => {
                console.log(error);
                toast.error("Произошла ошибка при импортировании формы");
            }).finally(() => {
                onClose();
            })
        })
    }

    return (
        <Dialog open={open} onClose={onClose} fullWidth>
            <DialogTitle>Импортировать форму</DialogTitle>
            <DialogContent>
                <Box sx={{ py: 2 }}>
                    <TextField
                        fullWidth
                        label="введите юрл формы"
                        multiline
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        rows={3}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Отмена</Button>
                <Button onClick={importForm}>Импортировать</Button>
            </DialogActions>
        </Dialog>
    )
}