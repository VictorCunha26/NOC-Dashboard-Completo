// backend/src/server.js
const express = require('express');
const cors = require('cors');
const frotaRoutes = require('./routes/frotaRoutes');
const infraRoutes = require('./routes/infraRoutes');
const frotaController = require('./controllers/frotaController');
const frotaRepository = require('./repositories/frotaRepository');
const infraRepository = require('./repositories/infraRepository');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// CRUD completo da frota (Lab 6): GET, GET/:id, POST, PUT/:id, DELETE/:id
app.use('/api/frota', frotaRoutes);

// Leitura da infraestrutura de links de comunicação
app.use('/api/infraestrutura', infraRoutes);

// Endpoint agregado, mantido para compatibilidade com o dashboard (front-end),
// que espera infraestrutura + base do NOC + frota numa única resposta.
app.get('/api/dados', async (req, res) => {
  try {
    const [infraestrutura, noc, frota] = await Promise.all([
      infraRepository.listarTodos(),
      infraRepository.buscarBaseNoc(),
      frotaRepository.listarTodos(500) // protegido contra o volume de Big Data
    ]);
    res.status(200).json({ infraestrutura, noc, frota });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao consultar os dados do dashboard.' });
  }
});

// Compatibilidade com o endpoint antigo de telemetria (rastreadores da frota)
app.put('/api/telemetria/:id', frotaController.atualizarTelemetria);

app.listen(PORT, () => {
  console.log(`🚀 Servidor operando em http://localhost:${PORT}`);
});
