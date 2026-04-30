const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static('public'));

const USERS_FILE = './users.json';

// Загрузка пользователей
const getUsers = () => JSON.parse(fs.readFileSync(USERS_FILE, 'utf8') || '[]');

// Регистрация
app.post('/api/register', (req, res) => {
    const { name, password } = req.body;
    const users = getUsers();

    if (users.find(u => u.Name === name)) {
        return res.status(400).json({ error: "Имя занято" });
    }

    const newUser = {
        ID: Date.now(),
        Verify: false,
        Name: name,
        Password: password // В реальном проекте используй bcrypt для хеширования!
    };

    users.push(newUser);
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    res.json({ success: true, user: newUser });
});

// Вход
app.post('/api/login', (req, res) => {
    const { name, password } = req.body;
    const users = getUsers();
    const user = users.find(u => u.Name === name && u.Password === password);

    if (user) {
        res.json({ success: true, user });
    } else {
        res.status(401).json({ error: "Неверные данные" });
    }
});

app.listen(3000, () => console.log('Diamond Server started on port 3000'));
