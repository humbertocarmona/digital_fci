import Database from "better-sqlite3";
import bcrypt from "bcrypt";

const db = new Database("fci_n.db");

export function addUser(name, username, password) {
  const hashedPassword = bcrypt.hashSync(password, 10);
  const stmt = db.prepare(
    "INSERT INTO users (name, username, password) VALUES (?, ?, ?)"
  );
  stmt.run(name, username, hashedPassword);
}

export function updateUserProgress(username, progress) {
  const stmt = db.prepare("UPDATE users SET progress = ? WHERE username = ?");
  stmt.run(progress, username);
}

export function getUserByUsername(username) {
  const stmt = db.prepare("SELECT * FROM users WHERE username = ?");
  return stmt.get(username);
}

export function getUserProgress(username) {
  const stmt = db.prepare("SELECT progress FROM users WHERE username = ?");
  const user = stmt.get(username);
  return user ? user.progress : null;
}

export function saveUserResponse(username, questionNumber, response) {
  const stmt = db.prepare(
    "INSERT INTO responses (username, question_number, response) VALUES (?, ?, ?)"
  );
  stmt.run(username, questionNumber, response);
}

export function checkExistingResponse(username, questionNumber) {
  const stmt = db.prepare(
    "SELECT * FROM responses WHERE username = ? AND question_number = ?"
  );
  return stmt.get(username, questionNumber);
}