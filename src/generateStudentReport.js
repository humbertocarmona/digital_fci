import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

export async function generateStudentReport({ school, className, username }) {
  const db = new Database('db/database.db');

  const query = `
    SELECT
      r.username,
      r.question_number,
      q.enunciate AS question_text,
      r.response,
      i.enunciate AS response_text,
      c.main_concept AS concept_name,
      m.main_misconception,
      m.specific_misconception,
      CASE
        WHEN r.response = q.id_correct_item THEN 'Correct'
        ELSE 'Incorrect'
      END AS correctness
    FROM responses r
    JOIN questions q ON r.question_number = q.id_question
    LEFT JOIN items i ON r.response = i.id_item
    LEFT JOIN concepts c ON q.id_concept = c.id_concept
    LEFT JOIN misconceptions m ON i.id_misconception = m.id_misconception
    WHERE r.username = ?
    ORDER BY r.question_number;
  `;

  const rows = db.prepare(query).all(username);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Report for ${username}</title>
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
  <h2>Report for ${username}</h2>
  <p><strong>School:</strong> ${school} &nbsp; | &nbsp; <strong>Class:</strong> ${className}</p>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Question</th>
        <th>Response</th>
        <th>Concept</th>
        <th>Main Misconception</th>
        <th>Specific Misconception</th>
        <th>Correctness</th>
      </tr>
    </thead>
    <tbody>
      ${rows.map(row => `
        <tr class="${row.correctness.toLowerCase()}">
          <td>${row.question_number}</td>
          <td>${row.question_text}</td>
          <td>${row.response_text || row.response}</td>
          <td>${row.concept_name || '—'}</td>
          <td>${row.main_misconception || '—'}</td>
          <td>${row.specific_misconception || '—'}</td>
          <td>${row.correctness}</td>
        </tr>`).join('')}
    </tbody>
  </table>
</body>
</html>`;

  const filename = `report_${username.replace(/\s+/g, '_')}.html`;
  const filepath = path.join('reports', filename);
  fs.writeFileSync(filepath, html);

  return filepath;
}


