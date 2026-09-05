// backend/server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json()); // Permite ler o Payload (body) das requisições

const db = new sqlite3.Database('./backend/noc_database.sqlite');

// Endpoint de Leitura (GET)
app.get('/api/dados', (req, res) => {
  const payload = { infraestrutura: [], frota: [], noc: {} };

  // Captura os dados gerais da infraestrutura (IDs 1 a 5)
  db.all("SELECT * FROM infraestrutura WHERE id > 0", [], (err, rowsInfra) => {
    if (err) return res.status(500).json({ error: err.message });
    payload.infraestrutura = rowsInfra;

    // Captura as coordenadas estáticas da Base do NOC (ID 0)
    db.get("SELECT latitude, longitude FROM infraestrutura WHERE id = 0", [], (err, rowNoc) => {
      if (!err && rowNoc) payload.noc = rowNoc;

      // Captura a frota
      db.all("SELECT * FROM frota", [], (err, rowsFrota) => {
        if (err) return res.status(500).json({ error: err.message });
        payload.frota = rowsFrota;
        res.json(payload);
      });
    });
  });
});

// Endpoint de Recebimento de Telemetria (Rastreadores enviam para cá)
app.put('/api/telemetria/:id', (req, res) => {
  const { id } = req.params;
  const { latitude, longitude, vel } = req.body;
  const query = `
    UPDATE frota
    SET latitude = ?, longitude = ?, vel = ?, ultima_atualizacao = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  db.run(query, [latitude, longitude, vel, id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Coordenadas do veículo atualizadas no SQL!", linhasAfetadas: this.changes });
  });
});

app.listen(port, () => console.log(`API do NOC rodando na porta ${port}`));
