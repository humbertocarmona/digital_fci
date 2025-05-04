// Import better-sqlite3 for efficient, synchronous SQLite access
import Database from "better-sqlite3";

// Import bcrypt for secure password hashing
import bcrypt from "bcrypt";

// Open (or create) the SQLite database file named 'database.db'
const db = new Database("db/database.db");

/**
 * Adds a new user to the database.
 * Hashes the password before storing it.
 *
 * @param {string} name - The user's full name
 * @param {string} username - The user's unique username
 * @param {string} password - The user's raw password (will be hashed)
 * @param {string} email - The user's email address
 * @param {string} phone - The user's phone number
 * @param {string} date_of_birth - The user's date of birth
 * @param {string} class_id - The user's class or group
 * @param {string} type - student or teacher
 */
export function addUser(
  name,
  username,
  password,
  email,
  phone,
  date_of_birth,
  class_id,
  type
) {
  const hashedPassword = bcrypt.hashSync(password, 10); // Hash the password with 10 salt rounds
  const stmt = db.prepare(`
    INSERT INTO users (
      name, username, password,
      email, phone, date_of_birth, class_id,type
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    name,
    username,
    hashedPassword,
    email,
    phone,
    date_of_birth,
    class_id,
    type
  );
}

/**
 * Updates a user's progress (e.g., the last completed question).
 *
 * @param {string} username - The user's username
 * @param {number} progress - The new progress value (e.g., question number)
 */
export function updateUserProgress(username, progress) {
  const stmt = db.prepare("UPDATE users SET progress = ? WHERE username = ?");
  stmt.run(progress, username); // Update progress in the users table
}

/**
 * Retrieves all user information by username.
 *
 * @param {string} username - The username to look up
 * @returns {object|undefined} - The user record, or undefined if not found
 */
export function getUserByUsername(username) {
  const stmt = db.prepare("SELECT * FROM users WHERE username = ?");
  return stmt.get(username); // Return the full user object
}

/**
 * Gets the current progress of a user.
 *
 * @param {string} username - The user's username
 * @returns {number|null} - The progress value or null if not found
 */
export function getUserProgress(username) {
  const stmt = db.prepare("SELECT progress FROM users WHERE username = ?");
  const user = stmt.get(username);
  return user ? String(user.progress).padStart(2, "0") : null;
}

/**
 * Saves a user's response to a specific question.
 *
 * @param {string} username - The user submitting the response
 * @param {number} questionNumber - The question number
 * @param {string} response - The user's answer
 */
export function saveUserResponse(username, questionNumber, response) {
  const stmt = db.prepare(
    "INSERT INTO responses (username, question_number, response) VALUES (?, ?, ?)"
  );
  stmt.run(username, questionNumber, response); // Save the response
}

/**
 * Checks if the user has already submitted a response to the given question.
 *
 * @param {string} username - The username to check
 * @param {number} questionNumber - The question number to check
 * @returns {object|undefined} - The response record if found, otherwise undefined
 */
export function checkExistingResponse(username, questionNumber) {
  const stmt = db.prepare(
    "SELECT * FROM responses WHERE username = ? AND question_number = ?"
  );
  return stmt.get(username, questionNumber); // Return existing response if any
}
