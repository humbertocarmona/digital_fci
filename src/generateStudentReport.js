import fs from "fs";
import path from "path";
import Database from "better-sqlite3";
import puppeteer from 'puppeteer';


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
    ORDER BY r.id
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
    body { font-family: Arial; margin: 20px; background: #fff; }
    h2 { margin-bottom: 5px; }
    p { margin-top: 0; margin-bottom: 20px; }

    table { border-collapse: collapse; width: 100%; }
    th, td { padding: 8px 12px; border: 1px solid #ccc; text-align: left; }
    th { background: #f4f4f4; cursor: pointer; }
    .correct { background-color: #c8e6c9; }
    .incorrect { background-color: #ffcdd2; }

    th.asc::after { content: " ▲"; }
    th.desc::after { content: " ▼"; }
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

    <script>
    document.querySelectorAll("th").forEach(th => {
      th.addEventListener("click", function () {
        const table = th.closest("table");
        const index = [...th.parentNode.children].indexOf(th);
        const rows = [...table.querySelectorAll("tbody tr")];
        const asc = !th.classList.contains("asc");

        rows.sort((a, b) => {
          const aText = a.children[index].textContent.trim();
          const bText = b.children[index].textContent.trim();
          const isNumeric = index === 0; // column # is index 0
          return asc
            ? (isNumeric ? parseInt(aText) - parseInt(bText) : aText.localeCompare(bText, 'pt-BR'))
            : (isNumeric ? parseInt(bText) - parseInt(aText) : bText.localeCompare(aText, 'pt-BR'));
        });

        rows.forEach(row => table.querySelector("tbody").appendChild(row));
        table.querySelectorAll("th").forEach(t => t.classList.remove("asc", "desc"));
        th.classList.toggle("asc", asc);
        th.classList.toggle("desc", !asc);
      });
    });
  </script>
</body>
</html>`;

  const filename = `report_${username.replace(/\s+/g, "_")}.html`;
  const filepath = path.join("reports", filename);
  fs.writeFileSync(filepath, html);

  return filepath;
}


export async function exportHtmlToPdf(htmlPath, pdfPath) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const absoluteHtmlPath = `file://${path.resolve(htmlPath)}`;
  await page.goto(absoluteHtmlPath, { waitUntil: 'networkidle0' });

  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' }
  });

  await browser.close();
}

