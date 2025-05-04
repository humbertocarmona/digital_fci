// Import the Express framework for building the web server and handling routes
import express from 'express';
// Import express-session for managing user sessions (e.g., login persistence)
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
// Import bcrypt for securely hashing and comparing passwords
import bcrypt from 'bcrypt'; // For hashing and checking passwords 

// Import custom modules for database and access control
import {
    addUser,
    updateUserProgress,
    getUserByUsername,
    getUserProgress,
    saveUserResponse,
    checkExistingResponse
} from "./dbAddUsers.js";

import { checkAccess } from "./middleware.js";
import './dbSetup.js'; // Set up the database on server startup 

// For resolving directory paths in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware to parse incoming JSON and URL-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware for managing login sessions
app.use(session({
    secret: 'your_secret_key', // Replace with a secure secret in production
    resave: false,
    saveUninitialized: true,
}));

app.get('/currentUser', (req, res) => {
    if (req.session.username) {
      res.json({ username: req.session.username });
    } else {
      res.status(401).json({ error: 'Usuário não autenticado' });
    }
  });

// Serve static files from public directories
app.use(express.static(path.join(__dirname, "..", "public")));
app.use("/libraries", express.static(path.join(__dirname, "..", "libraries")));
app.use("/node_modules", express.static(path.join(__dirname, "..", "node_modules")));

// Serve login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'login.html'));
});

// Handle login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = getUserByUsername(username);

    if (user && bcrypt.compareSync(password, user.password)) {
        req.session.username = username;
        const progress = getUserProgress(username)
        res.redirect(`/question`+progress);
    } else {
        res.status(401).send('Invalid login');
    }
});

// Route to serve the user registration form
app.get("/addUserForm", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "addUser.html"));
});

// Handle new user registration
app.post('/addUser', (req, res) => {
    const {
        name,
        username,
        password,
        school,
        email,
        phone,
        date_of_birth,
        class: turma,
        city,
        state
    } = req.body;

    console.log("Received form data:", req.body);

    try {
        addUser(name, username, password, school, email, phone, date_of_birth, turma, city, state);
        // res.send('Usuário adicionado com sucesso');
        res.redirect('/?success=1');

    } catch (err) {
        console.error('Erro ao adicionar usuário:', err);
        res.status(500).send('Erro ao adicionar usuário');
    }
});

// Serve question pages with access control
app.get('/question:questionNumber', checkAccess, (req, res) => {
    const questionNumber = req.params.questionNumber;
    res.sendFile(path.join(__dirname, `..`, `public`, `question${questionNumber}`, `index.html`));
});

// Handle form submissions and save user responses
app.post('/submitAnswer', (req, res) => {
    const { questionNumber, answer } = req.body;
    const username = req.session.username;

    try {
        const existingResponse = checkExistingResponse(username, questionNumber);

    // Prevent duplicate submissions
    if (existingResponse) {
            res.status(400).send('Você já respondeu essa questão.');
        } else {
            saveUserResponse(username, questionNumber, ''+questionNumber+answer);
            updateUserProgress(username, questionNumber + 1);
            // res.send('Resposta registrada com sucesso');
            res.send('ok');
        }
    } catch (err) {
        console.error('Erro ao enviar resposta:', err);
        // res.status(500).send('Erro ao enviar resposta' + err);
        res.status(500).send(`Erro ao enviar resposta: ${err.message}`);

    }
});

// Update user progress manually
app.post('/updateProgress', (req, res) => {
    const { username, progress } = req.body;
    try {
        updateUserProgress(username, progress);
        res.send('Progresso atualizado');
    } catch (err) {
        console.error('Erro ao atualizar progresso:', err);
        res.status(500).send('Erro ao atualizar progresso' + err);
    }
});


// Get cities by state
import Database from "better-sqlite3";
const db = new Database("fci_n.db");

app.get("/cities", (req, res) => {
    const { state } = req.query;
    const stmt = db.prepare("SELECT DISTINCT city FROM schools WHERE state = ?");
    const cities = stmt.all(state);
    res.json(cities.map(c => c.city));
});

// Get schools by city and state
app.get("/schools", (req, res) => {
    const { state, city } = req.query;
    const stmt = db.prepare("SELECT name FROM schools WHERE state = ? AND city = ?");
    const schools = stmt.all(state, city);
    res.json(schools.map(s => s.name));
});

// Start server
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
