// Import better-sqlite3 to interact with a SQLite database
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";

const createSchoolsTable = `
  CREATE TABLE IF NOT EXISTS schools (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL
  );
`;

const createClassTable = `CREATE TABLE IF NOT EXISTS classes (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,         -- e.g., "1A", "2B", or "Physics 2024"
  school_id INTEGER NOT NULL,
  FOREIGN KEY (school_id) REFERENCES schools(id)
);`;


const createUsersTable = `CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  email TEXT NOT NULL,
  class_id INTEGER NOT NULL,
  type TEXT NOT NULL, -- 'student' or 'teacher'
  progress INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY (class_id) REFERENCES classes(id));`;

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

const createConceptsTable = `
  CREATE TABLE IF NOT EXISTS concepts (
    id_concept TEXT PRIMARY KEY,
    main_concept TEXT,
    specific_concept TEXT,
    id_main_concept TEXT
  );
`;

const createMisconceptionsTable = `
  CREATE TABLE IF NOT EXISTS misconceptions (
    id_misconception TEXT PRIMARY KEY,
    main_misconception TEXT,
    specific_misconception TEXT,
    id_main_concept TEXT
  );
`;

const createQuestionsTable = `
  CREATE TABLE IF NOT EXISTS questions (
    id_question TEXT PRIMARY KEY,
    enunciate TEXT,
    id_correct_item TEXT,
    id_concept TEXT,
    FOREIGN KEY (id_concept) REFERENCES concepts(id_concept)
  );
`;

const createItemsTable = `
  CREATE TABLE IF NOT EXISTS items (
    id_item TEXT PRIMARY KEY,
    id_question TEXT NOT NULL,
    enunciate TEXT NOT NULL,
    id_concept TEXT,
    id_misconception TEXT,
    correct_item TEXT,
    FOREIGN KEY (id_question) REFERENCES questions(id_question),
    FOREIGN KEY (id_concept) REFERENCES concepts(id_concept),
    FOREIGN KEY (id_misconception) REFERENCES misconceptions(id_misconception)
  );
`;

//    correct_item TEXT CHECK (correct_item IN ('TRUE', 'FALSE')) NOT NULL,

// === Database Setup ===
const db = new Database("db/database.db");
db.pragma("journal_mode = WAL");

db.exec(createSchoolsTable);
db.exec(createClassTable);
db.exec(createUsersTable);
db.exec(createResponsesTable);
db.exec(createConceptsTable);
db.exec(createMisconceptionsTable);
db.exec(createQuestionsTable);
db.exec(createItemsTable);

// === Load schools.csv and seed schools table ===
const schoolsCsvPath = path.resolve("./src/csvs/schools.csv");
if (fs.existsSync(schoolsCsvPath)) {
  console.log("CSV file found at:", schoolsCsvPath);

  const csvData = fs
    .readFileSync(schoolsCsvPath, "utf-8")
    .replace(/^\uFEFF/, "")
    .trim();
  const lines = csvData.split("\n");
  const dataRows = lines
    .slice(1)
    .map((line) => line.split(",").map((v) => v.trim()));

  console.log("First school row:", dataRows[0]);

  const schoolCount = db
    .prepare("SELECT COUNT(*) as count FROM schools")
    .get().count;
  console.log("Schools in table before insert:", schoolCount);

  if (schoolCount === 0) {
    const insert = db.prepare(`
      INSERT INTO schools (name, city, state) VALUES (?, ?, ?)
    `);

    const insertMany = db.transaction((rows) => {
      for (const row of rows) {
        if (row.length === 3) {
          insert.run(row);
        } else {
          console.warn("Skipping malformed row:", row);
        }
      }
    });

    insertMany(dataRows);
    console.log(`Inserted ${dataRows.length} schools.`);
  } else {
    console.log("Schools table already populated.");
  }
} else {
  console.warn("CSV file 'schools.csv' not found. Skipping schools seeding.");
}

const classesCsvPath = path.resolve("./src/csvs/classes.csv");
if (fs.existsSync(classesCsvPath)) {
  console.log("CSV file found at:", classesCsvPath);

  const csvData = fs
    .readFileSync(classesCsvPath, "utf-8")
    .replace(/^\uFEFF/, "")
    .trim();
  const lines = csvData.split("\n");
  const dataRows = lines
    .slice(1)
    .map((line) => line.split(",").map((v) => v.trim()));

  console.log("First class row:", dataRows[0]);

  const classCount = db
    .prepare("SELECT COUNT(*) as count FROM classes")
    .get().count;
  console.log("Schools in table before insert:", classCount);

  if (classCount === 0) {
    const insert = db.prepare(`
      INSERT INTO classes (name, school_id) VALUES (?, ?)
    `);

    const insertMany = db.transaction((rows) => {
      for (const row of rows) {
        if (row.length === 2) {
          insert.run(row);
        } else {
          console.warn("Skipping malformed row:", row);
        }
      }
    });

    insertMany(dataRows);
    console.log(`Inserted ${dataRows.length} classes.`);
  } else {
    console.log("Classes table already populated.");
  }
} else {
  console.warn("CSV file 'classes.csv' not found. Skipping schools seeding.");
}


// === Load users.csv and seed users table ===
const usersCsvPath = path.resolve("./src/csvs/users.csv");
if (fs.existsSync(usersCsvPath)) {
  console.log("CSV file found at:", usersCsvPath);

  const csvData = fs
    .readFileSync(usersCsvPath, "utf-8")
    .replace(/^\uFEFF/, "")
    .trim();
  const lines = csvData.split("\n");
  const headers = lines[0].split(",").map((h) => h.trim());
  const dataRows = lines
    .slice(1)
    .map((line) => line.split(",").map((v) => v.trim()));

  console.log("First user row:", dataRows[0]);

  const userCount = db
    .prepare("SELECT COUNT(*) as count FROM users")
    .get().count;
  console.log("Users in table before insert:", userCount);

  if (userCount === 0) {
    const insert = db.prepare(`
      INSERT INTO users (
        name, username, password,  email, class_id, type
      ) VALUES (?, ?, ?, ?, ?, ?);
    `);

    const insertMany = db.transaction((rows) => {
      // Hash once before insert loop
      const defaultPasswordPlain = "123";
      const defaultHashedPassword = bcrypt.hashSync(defaultPasswordPlain, 10);

      for (const row of rows) {
        console.log(''+row.length);
        if (row.length === 5) {
          insert.run([
            row[0], // name
            row[1], // username
            defaultHashedPassword,
            row[2], // email
            row[3], // class_id
            row[4], // type
          ]);
        } else {
          console.warn("Skipping malformed user row:", row);
        }
      }
    });

    insertMany(dataRows);
    console.log(`Inserted ${dataRows.length} users with default passwords.`);
  } else {
    console.log("Users table already populated.");
  }
} else {
  console.warn("CSV file 'users.csv' not found. Skipping user seeding.");
}

// === Load concepts.csv and seed table ===
const csvPath = path.resolve("./src/csvs/concepts.csv");
if (fs.existsSync(csvPath)) {
  console.log("CSV file found at:", csvPath);

  const csvData = fs.readFileSync(csvPath, "utf-8").trim();
  const lines = csvData.split("\n");
  const dataRows = lines
    .slice(1)
    .map((line) => line.split(",").map((v) => v.trim()));

  const insert = db.prepare(`
    INSERT OR IGNORE INTO concepts (id_concept, main_concept, specific_concept, id_main_concept)
    VALUES (?, ?, ?, ?)
  `);

  const insertMany = db.transaction((rows) => {
    for (const row of rows) {
      insert.run(row);
    }
  });

  const conceitoCount = db
    .prepare("SELECT COUNT(*) as count FROM concepts")
    .get().count;
  if (conceitoCount === 0) {
    insertMany(dataRows);
    console.log("Concepts seeded from CSV.");
  } else {
    console.log("Concepts table already populated.");
  }
} else {
  console.warn(
    "CSV file './concepts.csv' not found. Skipping conceitos seeding."
  );
}

// === Load concepts.csv and seed table ===
const misconceptionsCsvPath = path.resolve("./src/csvs/misconceptions.csv");
if (fs.existsSync(misconceptionsCsvPath)) {
  console.log("CSV file found at:", misconceptionsCsvPath);

  const csvData = fs.readFileSync(misconceptionsCsvPath, "utf-8").trim();
  const lines = csvData.split("\n");
  const dataRows = lines
    .slice(1)
    .map((line) => line.split(",").map((v) => v.trim()));

  const insert = db.prepare(`
    INSERT OR IGNORE INTO misconceptions (id_misconception, main_misconception, specific_misconception, id_main_concept)
    VALUES (?, ?, ?, ?)
  `);

  const insertMany = db.transaction((rows) => {
    for (const row of rows) {
      insert.run(row);
    }
  });

  const misconceptionsCount = db
    .prepare("SELECT COUNT(*) as count FROM misconceptions")
    .get().count;
  if (misconceptionsCount === 0) {
    insertMany(dataRows);
    console.log("misconceptions seeded from CSV.");
  } else {
    console.log("misconceptions table already populated.");
  }
} else {
  console.warn(
    "CSV file './misconceptions.csv' not found. Skipping conceitos seeding."
  );
}

// === Load questions.csv and seed questions table ===
const questionsCsvPath = path.resolve("./src/csvs/questions.csv");
if (fs.existsSync(questionsCsvPath)) {
  console.log("CSV file found at:", questionsCsvPath);

  const csvData = fs
    .readFileSync(questionsCsvPath, "utf-8")
    .replace(/^\uFEFF/, "")
    .trim();
  const lines = csvData.split("\n");
  const headers = lines[0].split(",").map((h) => h.trim());

  const dataRows = lines
    .slice(1)
    .map((line) => {
      const match = line.match(/^([^,]+),"(.*)",([^,]+),([^,]+)$/);
      if (match) {
        return [
          match[1].trim(), // id_question
          match[2].trim(), // enunciate (may contain HTML and commas)
          match[3].trim(), // id_correct_item
          match[4].trim(), // id_concept
        ];
      } else {
        console.warn("Skipping malformed row:", line);
        return null;
      }
    })
    .filter((row) => row !== null);

  const questionCount = db
    .prepare("SELECT COUNT(*) as count FROM questions")
    .get().count;
  console.log("Questions in table before insert:", questionCount);

  if (questionCount === 0) {
    const insert = db.prepare(`
      INSERT INTO questions (id_question, enunciate, id_correct_item, id_concept)
      VALUES (?, ?, ?, ?)
    `);

    const insertMany = db.transaction((rows) => {
      for (const row of rows) {
        insert.run(row);
      }
    });

    insertMany(dataRows);
    console.log(`Inserted ${dataRows.length} questions.`);
  } else {
    console.log("Questions table already populated.");
  }
} else {
  console.warn(
    "CSV file 'questions.csv' not found. Skipping questions seeding."
  );
}
// === =========================================================================

// === Load items.csv and seed items table ===
const itemsCsvPath = path.resolve("./src/csvs/items.csv");
if (fs.existsSync(itemsCsvPath)) {
  console.log("CSV file found at:", itemsCsvPath);

  const csvData = fs
    .readFileSync(itemsCsvPath, "utf-8")
    .replace(/^\uFEFF/, "")
    .trim();
  const lines = csvData.split("\n");
  const headers = lines[0].split(",").map((h) => h.trim());

  const dataRows = lines
    .slice(1)
    .map((line) => {
      // const fields = line.split(',').map(field => field.trim());
      const fields = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
      if (fields.length !== 6) {
        console.log(fields);
        console.log(fields.length);
        console.warn("Skipping malformed row:", line);
        return null;
      }
      return fields;
    })
    .filter((row) => row !== null);

  const itemCount = db
    .prepare("SELECT COUNT(*) as count FROM items")
    .get().count;
  console.log("Items in table before insert:", itemCount);

  if (itemCount === 0) {
    const insert = db.prepare(`
      INSERT INTO items (
        id_item, id_question, enunciate,
        id_concept, id_misconception, correct_item
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((rows) => {
      for (const row of rows) {
        insert.run([
          row[0], // id_item
          row[1], // id_question
          row[2], // enunciate
          row[3] || null, // id_concept
          row[4] || null, // id_misconception
          row[5].toUpperCase(), // correct_item (e.g. TRUE/FALSE)
        ]);
      }
    });

    insertMany(dataRows);
    console.log(`Inserted ${dataRows.length} items.`);
  } else {
    console.log("Items table already populated.");
  }
} else {
  console.warn("CSV file 'items.csv' not found. Skipping items seeding.");
}
// === =========================================================================
