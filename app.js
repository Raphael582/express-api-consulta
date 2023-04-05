const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const port = 80; // Alterado para a porta 80

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const db = new sqlite3.Database('pessoas.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the SQLite database.');
});

function logRequest(req, res, next) {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log(`[${new Date().toISOString()}] IP: ${ip}, Nome completo: ${req.query.nome_completo}`);
  next();
}

app.get('/pessoas', logRequest, (req, res) => {
  const nome_completo = req.query.nome_completo;

  if (!nome_completo) {
    res.status(400).json({ error: "O parâmetro 'nome_completo' é obrigatório." });
    return;
  }

  // Modificada a query para usar 'nome_completo' diretamente
  const query = `SELECT * FROM pessoas WHERE nome = ?`;

  db.all(query, [nome_completo], (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Ocorreu um erro ao executar a query.' });
    } else {
      res.json(rows);
    }
  });
});



app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Closed the SQLite database connection.');
  });
  process.exit(0);
});
