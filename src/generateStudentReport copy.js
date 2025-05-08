import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

export async function generateStudentReport({ username }) {
  const db = new Database("db/database.db");

  const query = `
    SELECT
      u.name AS student_name,
      s.name AS school_name,
      c.name AS class_name,               
      r.id AS response_id,
      r.response AS student_response,
      co.main_concept AS main_concept, 
      CASE
        WHEN r.response = q.id_correct_item THEN co.specific_concept
        ELSE misconceptions.specific_misconception
      END AS student_understanding,
      CASE
        WHEN r.response = q.id_correct_item THEN 'correct'
        ELSE 'incorrect'
      END AS is_correct
    FROM responses r 
    JOIN users u ON r.username = u.username
    JOIN classes c ON u.class_id = c.id
    JOIN schools s ON c.school_id = s.id
    JOIN items i ON r.response = i.id_item
    JOIN questions q ON i.id_question = q.id_question
    JOIN concepts co ON q.id_concept = co.id_concept
    LEFT JOIN misconceptions ON i.id_misconception = misconceptions.id_misconception
    WHERE u.username = ?
    ORDER BY main_concept
  `;

  const rows = db.prepare(query).all(username);
  const totalQuestions = rows.length;
  const correctCount = rows.filter(
    (row) => row.is_correct === "correct"
  ).length;

  if (rows.length === 0) {
    throw new Error(`No responses found for username: ${username}`);
  }

  const { student_name, school_name, class_name } = rows[0];
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Relatório para  ${student_name}</title>
  <style>
    body { font-family: Arial; margin: 20px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { padding: 8px 12px; border: 1px solid #ccc; }
    th { background: #f4f4f4; }
    .correct { background-color: #c8e6c9; }
    .incorrect { background-color: #ffcdd2; }
  </style>
</head>
<body>
  <h2>Relatório para ${student_name}</h2>
  <p>
      <strong>Escola:</strong> ${school_name} &nbsp; | &nbsp;
      <strong>Turma:</strong> ${class_name} &nbsp; | &nbsp;
      <strong>Nota:</strong> ${correctCount}/${totalQuestions} acertos
  </p>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Conceito Principal</th>
        <th>Resposta do Estudante</th>
        <th>Compreensão do Estudante</th>
      </tr>
    </thead>
    <tbody>
      ${rows
        .map(
          (row) => `
        <tr class="${row.is_correct}">
          <td>${row.response_id}</td>
          <td>${row.main_concept}</td>
          <td>${row.student_response}</td>
          <td>${row.student_understanding || "—"}</td>
        </tr>`
        )
        .join("")}
    </tbody>
  </table>
</body>
</html>`;

  const filename = `report_${username.replace(/\s+/g, "_")}.html`;
  const filepath = path.join("reports", filename);
  fs.writeFileSync(filepath, html);

  return filepath;
}

// school and classname are undefined
