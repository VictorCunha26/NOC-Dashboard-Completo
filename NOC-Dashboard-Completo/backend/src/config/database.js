// backend/src/config/database.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../noc_bigdata.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Erro ao conectar ao banco de dados:', err.message);
  else console.log('Conexão estabelecida com o SQLite.');
});

// Tabela de Frota, otimizada para o volume de Big Data (100.000+ registros)
db.run(`CREATE TABLE IF NOT EXISTS frota (
  id TEXT PRIMARY KEY,
  modelo TEXT,
  tipo TEXT,
  vel TEXT,
  latitude TEXT,
  longitude TEXT,
  ultima_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// Tabela de Infraestrutura (links de comunicação monitorados pelo NOC)
db.run(`CREATE TABLE IF NOT EXISTS infraestrutura (
  id INTEGER PRIMARY KEY,
  tipo TEXT,
  target TEXT,
  latencia TEXT,
  latitude TEXT,
  longitude TEXT
)`);

module.exports = db;
