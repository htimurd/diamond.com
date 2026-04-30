const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static('public'));

const USERS_FILE = './users.json';

// Чтение и запись БД
const getUsers = () => JSON.parse(fs.readFileSync(USERS_FILE, 'utf8') || '[]');
const saveUsers = (users) => fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

// Auth API
app.post('/api/register', (req, res) => {
    const { name, password } = req.body;
    let users = getUsers();
    if (users.find(u => u.Name === name)) return res.status(400).json({ error: "Имя занято" });
    
    const newUser = { ID: Date.now(), Verify: false, Name: name, Password: password };
    users.push(newUser);
    saveUsers(users);
    res.json({ success: true, user: newUser });
});

app.post('/api/login', (req, res) => {
    const { name, password } = req.body;
    const user = getUsers().find(u => u.Name === name && u.Password === password);
    user ? res.json({ success: true, user }) : res.status(401).json({ error: "Ошибка входа" });
});

// Real-time чат
io.on('connection', (socket) => {
    socket.on('join_group', (groupName) => {
        socket.join(groupName);
    });

    socket.on('send_msg', (data) => {
        // Рассылка всем в группе/чате
        io.to(data.group).emit('receive_msg', data);
    });
});

server.listen(3000, () => console.log('Diamond Server: http://localhost:3000'));
