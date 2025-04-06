// Import better-sqlite3 to interact with a SQLite database
import Database from 'better-sqlite3';




// SQL statement to create the 'users' table if it doesn't exist
// Create 'users' table with extended fields
const createUsersTable = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    school TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    date_of_birth TEXT NOT NULL,
    class TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    progress INTEGER NOT NULL DEFAULT 1
  );
`;

// Create 'schools' table
const createSchoolsTable = `
  CREATE TABLE IF NOT EXISTS schools (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL
  );
`;

// SQL statement to create the 'responses' table if it doesn't exist
const createResponsesTable = `
    CREATE TABLE IF NOT EXISTS responses (
        id INTEGER PRIMARY KEY,                       -- Unique ID for each response
        username STRING NOT NULL,                     -- Username of the responder (foreign key)
        question_number INTEGER NOT NULL,             -- Question number
        response STRING NOT NULL,                     -- User's answer
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, -- Timestamp of submission
        FOREIGN KEY (username) REFERENCES users(username) -- Link response to a user
    )
`;

// Alternative design idea (commented out):
// This version would enforce uniqueness for each (username, question_number) pair
// so users can't submit multiple responses to the same question.
// You could replace the active query with this if needed:
// UNIQUE (username, question_number)





// Open (or create if it doesn't exist) the SQLite database file named 'fci_n.db'
const db = new Database('fci_n.db');


// Enable WAL for better performance
db.pragma('journal_mode = WAL');
;

// Execute the SQL statements to create tables
db.exec(createUsersTable);
db.exec(createSchoolsTable)
db.exec(createResponsesTable);

// Seed sample schools for Fortaleza, CE (only if table is empty)
const schoolCount = db.prepare("SELECT COUNT(*) as count FROM schools").get().count;

if (schoolCount === 0) {
  const insert = db.prepare("INSERT INTO schools (name, city, state) VALUES (?, ?, ?)");
  const schools = [
    "EEMTI Adauto Bezerra",
    "EEMTI José de Alencar",
    "EEMTI Dom Helder Câmara",
    "EEMTI Liceu do Ceará",
    "EEMTI Presidente Castelo Branco"
  ];
  
  const insertMany = db.transaction((schools) => {
    for (const name of schools) {
      insert.run(name, "Fortaleza", "CE");
    }
  });

  insertMany(schools);
}
