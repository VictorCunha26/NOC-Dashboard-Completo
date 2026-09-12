// backend/src/config/seed.js
const db = require('./database');

const categorias = [
  { tipo: "Ônibus", modelo: "🚌" }, { tipo: "Caminhão", modelo: "🚚" },
  { tipo: "Moto", modelo: "🏍" }, { tipo: "Carro", modelo: "🚗" },
  { tipo: "Caminhonete", modelo: "🛻" }, { tipo: "Van", modelo: "🚐" },
  { tipo: "SUV", modelo: "🚙" }, { tipo: "Esportivo", modelo: "🏎" },
  { tipo: "Trator", modelo: "🚜" }, { tipo: "Ambulância", modelo: "🚑" }
];

// Links de comunicação do NOC (poucos registros fixos, incluindo a Base em id=0)
const infraDados = [
  [0, "Base NOC", "SENAI SP Vila Leopoldina", "0ms", "-23.5315", "-46.7358"],
  [1, "Link VSAT (Hub Principal)", "Satélite Star One D2", "580ms", null, null],
  [2, "Link VSAT (BGAN Backup)", "Satélite Inmarsat", "850ms", null, null],
  [3, "Roteamento OSPF", "Core Interno (10.0.0.1)", "2ms", null, null],
  [4, "Sessão BGP", "Operadora AS-1042", "12ms", null, null],
  [5, "Link LTE-Móvel", "Antena Celular ERB", "45ms", null, null]
];

// Gera coordenadas espalhadas pelo território nacional (base: centro do Brasil)
function gerarCoordenada(base, variancia) {
  return (base + (Math.random() * variancia - variancia / 2)).toFixed(4);
}

db.serialize(() => {
  console.log("Iniciando geração de carga de Big Data. Aguarde...");

  // Infraestrutura: poucos registros fixos, gravados fora da transação de frota
  const stmtInfra = db.prepare(`INSERT OR REPLACE INTO infraestrutura (id, tipo, target, latencia, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?)`);
  infraDados.forEach(d => stmtInfra.run(d));
  stmtInfra.finalize();

  // Frota: carga massiva usando Transação SQL (BEGIN/COMMIT) para gravar em poucos segundos
  db.run("BEGIN TRANSACTION");
  const stmtFrota = db.prepare(`INSERT OR REPLACE INTO frota (id, modelo, tipo, vel, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?)`);

  let count = 1;
  const volumePorCategoria = 10000; // 10.000 veículos por categoria = 100.000 no total
  categorias.forEach(cat => {
    for (let i = 0; i < volumePorCategoria; i++) {
      const id = `V-${count.toString().padStart(6, '0')}`;
      const vel = Math.floor(Math.random() * 120).toString();
      const lat = gerarCoordenada(-14.23, 30); // Base: Centro do Brasil
      const lng = gerarCoordenada(-51.92, 30);
      stmtFrota.run([id, cat.modelo, cat.tipo, vel, lat, lng]);
      count++;
    }
  });

  stmtFrota.finalize();
  db.run("COMMIT", () => {
    console.log(`Sucesso! ${count - 1} veículos foram inseridos no banco de dados.`);
    db.close();
  });
});
