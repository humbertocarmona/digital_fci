// app.js (cleaned and updated version)

import express from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import bcrypt from "bcrypt";
import Database from "better-sqlite3";

import {
  addUser,
  updateUserProgress,
  getUserByUsername,
  getUserProgress,
  saveUserResponse,
  checkExistingResponse,
} from "./dbAddUsers.js";

import { checkAccess } from "./middleware.js";
import {
  generateStudentReport,
  exportHtmlToPdf,
} from "./generateStudentReport.js";
import { generateClassReport } from "./generateClassReport.js";
import "./dbSetup.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const PORT = 3000;

const db = new Database("db/database.db");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
  })
);

// Static directories
app.use(express.static(path.join(__dirname, "..", "public")));
app.use("/reports", express.static(path.join(__dirname, "..", "reports")));
app.use("/libraries", express.static(path.join(__dirname, "..", "libraries")));
app.use(
  "/node_modules",
  express.static(path.join(__dirname, "..", "node_modules"))
);

// Routes
app.get("/currentUser", (req, res) => {
  if (req.session.username) {
    res.json({ username: req.session.username });
  } else {
    res.status(401).json({ error: "Usuário não autenticado" });
  }
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "login.html"));
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = getUserByUsername(username);

  if (user && bcrypt.compareSync(password, user.password)) {
    req.session.username = username;

    if (user.type === "teacher") {
      // Redirect teacher to report form
      res.redirect("/teacher_login.html");
      // res.redirect("/studentReport.html");
    } else if (user.type === "student") {
      const progress = getUserProgress(username);
      if (progress < 31) {
        res.redirect(`questions/question${progress}`);
      }else{
        res.redirect(`questions/question01`);
      }
    } else {
      res.status(400).send("Tipo de usuário desconhecido.");
    }
  } else {
    res.status(401).send("Invalid login");
  }
});

app.get("/addUserForm", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "addUser.html"));
});

app.post("/addUserPost", (req, res) => {
  const { name, username, password, email, class_id, type } = req.body;
  try {
    console.log(type);
    addUser(name, username, password, email, class_id, type);
    res.redirect("/?success=1");
  } catch (err) {
    console.error("Erro ao adicionar usuário:", err);
    res.status(500).send("Erro ao adicionar usuário");
  }
});

app.get("/questions/question:questionNumber", checkAccess, (req, res) => {
  const questionNumber = req.params.questionNumber;
  res.sendFile(
    path.join(
      __dirname,
      "..",
      "public",
      `questions/question${questionNumber}`,
      "index.html"
    )
  );
});

app.post("/submitAnswer", (req, res) => {
  const { questionNumber, answer } = req.body;
  const username = req.session.username;

  try {
    const existingResponse = checkExistingResponse(username, questionNumber);
    if (existingResponse) {
      res.status(400).send("Você já respondeu essa questão.");
    } else {
      saveUserResponse(username, questionNumber, `${questionNumber}${answer}`);
      updateUserProgress(username, questionNumber + 1);
      res.send("ok");
    }
  } catch (err) {
    console.error("Erro ao enviar resposta:", err);
    res.status(500).send(`Erro ao enviar resposta: ${err.message}`);
  }
});

app.post("/updateProgress", (req, res) => {
  const { username, progress } = req.body;
  try {
    updateUserProgress(username, progress);
    res.send("Progresso atualizado");
  } catch (err) {
    console.error("Erro ao atualizar progresso:", err);
    res.status(500).send("Erro ao atualizar progresso: " + err);
  }
});

app.get("/api/schools", (req, res) => {
  const stmt = db.prepare("SELECT id, name FROM schools");
  res.json(stmt.all());
});

app.get("/api/classes", (req, res) => {
  const { school_id } = req.query;
  if (!school_id) return res.status(400).json({ error: "Missing school_id" });

  const stmt = db.prepare("SELECT id, name FROM classes WHERE school_id = ?");
  res.json(stmt.all(school_id));
});

app.get("/api/students", (req, res) => {
  const class_id = req.query.class_id;
  if (!class_id)
    return res.status(400).json({ error: "Missing class_id parameter" });

  const stmt = db.prepare(`
    SELECT username, name
    FROM users
    WHERE type = 'student' AND class_id = ?
  `);

  res.json(stmt.all(class_id));
});

app.post("/addSchoolWithClasses", (req, res) => {
  const { name, city, state, classNames } = req.body;

  try {
    const insertSchool = db.prepare(
      "INSERT INTO schools (name, city, state) VALUES (?, ?, ?)"
    );
    const schoolResult = insertSchool.run(name, city, state);
    const schoolId = schoolResult.lastInsertRowid;

    const insertClass = db.prepare(
      "INSERT INTO classes (name, school_id) VALUES (?, ?)"
    );
    const classSet = new Set(
      classNames
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean)
    );
    for (const className of classSet) insertClass.run(className, schoolId);

    res.send("✅ Escola e turmas adicionadas com sucesso!");
  } catch (err) {
    console.error("❌ Erro ao adicionar escola e turmas:", err);
    res.status(500).send("Erro ao adicionar escola e turmas.");
  }
});

// app.post("/generate-report", async (req, res) => {
//   try {
//     const { school, class_id: classId, student: username } = req.body;

//     if (!school || !classId || !username) {
//       return res.status(400).send("Dados ausentes do formulário.");
//     }

//     const reportPath = await generateStudentReport({
//       username,
//     });

//     // res.redirect(`/reports/${path.basename(reportPath)}`);

//     // Convert HTML to PDF
//     const pdfPath = reportPath.replace(/\.html$/, '.pdf');
//     await exportHtmlToPdf(reportPath, pdfPath);

//     // Redirect to PDF file instead of HTML
//     res.redirect(`/reports/${path.basename(pdfPath)}`);
//   } catch (err) {
//     console.error("❌ Erro ao gerar relatório:", err);
//     res.status(500).send("Erro ao gerar o relatório.");
//   }
// });

app.post("/generate-report", async (req, res) => {
  try {
    const { school, class_id: classId, student: username, format } = req.body;

    if (!school || !classId || !username) {
      return res.status(400).send("Dados ausentes do formulário.");
    }

    const reportPath = await generateStudentReport({ username });

    if (format === "pdf") {
      const pdfPath = reportPath.replace(/\.html$/, ".pdf");
      await exportHtmlToPdf(reportPath, pdfPath);
      return res.redirect(`/reports/${path.basename(pdfPath)}`);
    }

    // default to HTML
    return res.redirect(`/reports/${path.basename(reportPath)}`);
  } catch (err) {
    console.error("❌ Erro ao gerar relatório:", err);
    res.status(500).send("Erro ao gerar o relatório.");
  }
});

app.post("/class-report", async (req, res) => {
  try {
    const { school: school_id, class_id, format } = req.body;
    console.log("escola " + school_id);
    console.log(class_id);
    if (!school_id || !class_id) {
      return res.status(400).send("Dados ausentes do formulário.");
    }

    const reportPath = await generateClassReport({ class_id });

    if (format === "pdf") {
      const pdfPath = reportPath.replace(/\.html$/, ".pdf");
      await exportHtmlToPdf(reportPath, pdfPath);
      return res.redirect(`/reports/${path.basename(pdfPath)}`);
    }

    // default to HTML
    return res.redirect(`/reports/${path.basename(reportPath)}`);
  } catch (err) {
    console.error("❌ Erro ao gerar relatório:", err);
    res.status(500).send("Erro ao gerar o relatório.");
  }
});

// Start server
app.listen(PORT, () => {
  console.log(
    `Server running at http://localhost:${PORT}  or  http://coruja.fisica.ufc.br:${PORT}`
  );
});
