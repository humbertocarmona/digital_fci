import fs from "fs";
import path from "path";
import Database from "better-sqlite3";
import puppeteer from "puppeteer";

export async function generateClassReport({ class_id }) {
  const db = new Database("db/database.db");

  const query = `
SELECT
  s.name AS school_name,
  c.name AS class_name,
  q.id_question AS question_id,
  co.main_concept AS main_concept,
  i.id_item AS item_id,
  IFNULL(r.response, '—') AS student_response,
  CASE
    WHEN r.response = q.id_correct_item THEN co.specific_concept
    WHEN r.response IS NOT NULL THEN misconceptions.specific_misconception
    ELSE '—'
  END AS student_understanding,
  COUNT(r.response) AS response_count
FROM questions q
JOIN concepts co ON q.id_concept = co.id_concept
JOIN items i ON i.id_question = q.id_question
LEFT JOIN responses r ON r.response = i.id_item
LEFT JOIN users u ON r.username = u.username
LEFT JOIN misconceptions ON i.id_misconception = misconceptions.id_misconception
JOIN classes c ON c.id = ?
JOIN schools s ON c.school_id = s.id
GROUP BY s.name, q.id_question, co.main_concept, i.id_item, r.response, student_understanding
ORDER BY q.id_question, response_count DESC;
  `;

  const rows = db.prepare(query).all(class_id);

  const statsQuery = `
  SELECT 
    COUNT(*) AS total_responses,
    SUM(CASE WHEN r.response = q.id_correct_item THEN 1 ELSE 0 END) AS correct_responses,
    100.0 * SUM(CASE WHEN r.response = q.id_correct_item THEN 1 ELSE 0 END) / COUNT(*) AS percent_correct
  FROM responses r
  JOIN users u ON r.username = u.username
  JOIN classes c ON u.class_id = c.id
  JOIN items i ON r.response = i.id_item
  JOIN questions q ON i.id_question = q.id_question
  WHERE c.id = ?;
`;
  const stats = db.prepare(statsQuery).get(class_id);

  // const totalQuestions = rows.length;
  // const correctCount = rows.filter(
  //   (row) => row.is_correct === "correct"
  // ).length;
  const percentCorrect = stats.percent_correct.toFixed(1);

  if (rows.length === 0) {
    throw new Error(`No responses found for class_id: ${class_id}`);
  }

  const { school_name, class_name } = rows[0];
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Relatório para turma ${class_name}</title>
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
  <h2>Relatório para turma ${class_name}</h2>
  <p>
      <strong>Escola:</strong> ${school_name} &nbsp; | &nbsp;
      <strong>Nota:</strong> ${percentCorrect} % acertos
  </p>
  <table>
    <thead>
      <tr>
        <th>Questão</th>
        <th>Conceito Principal</th>
        <th>Item</th>
        <th>Compreensão do Estudante</th>
        <th>Respostas</th>
      </tr>
    </thead>
    <tbody>
      ${rows
        .map(
          (row) => `
        <tr class="${row.is_correct}">
          <td>${row.question_id}</td>
          <td>${row.main_concept}</td>
          <td>${row.item_id}</td>
          <td>${row.student_understanding || "—"}</td>
          <td>${row.response_count || "—"}</td>
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

  const filename = `report_${school_name.replace(
    /\s+/g,
    "_"
  )}_${class_name}.html`;
  const filepath = path.join("reports", filename);
  fs.writeFileSync(filepath, html);

  return filepath;
}

export async function exportHtmlToPdf(htmlPath, pdfPath) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const absoluteHtmlPath = `file://${path.resolve(htmlPath)}`;
  await page.goto(absoluteHtmlPath, { waitUntil: "networkidle0" });

  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
    margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
  });

  await browser.close();
}
