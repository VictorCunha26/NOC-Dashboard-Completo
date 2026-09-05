// backend/migracao.js
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./backend/noc_database.sqlite', (err) => {
  if (err) return console.error(err.message);
  console.log('Conectado ao banco de dados SQLite.');
});

db.serialize(() => {
  // 1. Tabela de Infraestrutura (Incluindo a Base NOC)
  db.run(`CREATE TABLE IF NOT EXISTS infraestrutura (
    id INTEGER PRIMARY KEY, tipo TEXT, target TEXT, latencia TEXT, latitude TEXT, longitude TEXT
  )`);

  // 2. Tabela de Frota Otimizada para Telemetria Geográfica
  db.run(`CREATE TABLE IF NOT EXISTS frota (
    id TEXT PRIMARY KEY,
    modelo TEXT,
    tipo TEXT,
    vel TEXT,
    latitude TEXT,
    longitude TEXT,
    ultima_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  const stmtInfra = db.prepare(`INSERT OR REPLACE INTO infraestrutura (id, tipo, target, latencia, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?)`);
  const stmtFrota = db.prepare(`INSERT OR REPLACE INTO frota (id, modelo, tipo, vel, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?)`);

  // Inserindo a Base do NOC (SENAI Vila Leopoldina) no ID 0
  const infraDados = [
    [0, "Base NOC", "SENAI SP Vila Leopoldina", "0ms", "-23.5315", "-46.7358"],
    [1, "Link VSAT (Hub Principal)", "Satélite Star One D2", "580ms", null, null],
    [2, "Link VSAT (BGAN Backup)", "Satélite Inmarsat", "850ms", null, null],
    [3, "Roteamento OSPF", "Core Interno (10.0.0.1)", "2ms", null, null],
    [4, "Sessão BGP", "Operadora AS-1042", "12ms", null, null],
    [5, "Link LTE-Móvel", "Antena Celular ERB", "45ms", null, null]
  ];

  // Frota com Lat/Lng segregadas para integração nativa com Maps
  const frotaDados = [
    ["V-01", "🚌", "Ônibus", "85", "-23.5500", "-46.6333"],
    ["V-02", "🚚", "Caminhão", "70", "-22.9000", "-43.2000"],
    ["V-03", "🏍", "Moto", "110", "-19.9200", "-43.9300"],
    ["V-04", "🚗", "Carro", "110", "-25.4200", "-49.2700"],
    ["V-05", "🛻", "Caminhonete", "80", "-30.0300", "-51.2300"],
    ["V-06", "🚐", "Van", "75", "-15.7900", "-47.8800"],
    ["V-07", "🚙", "SUV", "100", "-12.9700", "-38.5000"],
    ["V-08", "🏎", "Esportivo", "140", "-03.1100", "-60.0200"],
    ["V-09", "🚜", "Trator", "30", "-16.6800", "-49.2500"],
    ["V-10", "🚑", "Ambulância", "120", "-20.3100", "-40.3100"]
  ];

  infraDados.forEach(d => stmtInfra.run(d));
  frotaDados.forEach(d => stmtFrota.run(d));
  stmtInfra.finalize();
  stmtFrota.finalize();
  console.log('Migração de Geolocalização concluída!');
});

db.close();
