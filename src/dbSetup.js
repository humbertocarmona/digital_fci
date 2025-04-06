import Database from 'better-sqlite3';
const db = new Database('fci_n.db')
db.pragma('journal_mode = WAL');

const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        name STRING NOT NULL,
        username STRING NOT NULL UNIQUE,
        password STRING NOT NULL,
        progress INTEGER NOT NULL DEFAULT 1
    )
`;

const createResponsesTable = `
    CREATE TABLE IF NOT EXISTS responses (
        id INTEGER PRIMARY KEY,
        username STRING NOT NULL,
        question_number INTEGER NOT NULL,
        response STRING NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (username) REFERENCES users(username)
    )
`;
// CREATE TABLE IF NOT EXISTS responses (
//     id INTEGER PRIMARY KEY,
//     username STRING NOT NULL,
//     question_number INTEGER NOT NULL,
//     response STRING NOT NULL,
//     timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
//     FOREIGN KEY (username) REFERENCES users(username),
//     UNIQUE (username, question_number)
// )
db.exec(createUsersTable);
db.exec(createResponsesTable);


