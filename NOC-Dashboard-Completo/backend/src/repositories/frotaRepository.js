// backend/src/repositories/frotaRepository.js
const db = require('../config/database');

class FrotaRepository {
  // READ com limite de segurança para proteger a interface gráfica
  listarTodos(limite = 500) {
    return new Promise((resolve, reject) => {
      db.all(`SELECT * FROM frota ORDER BY RANDOM() LIMIT ?`, [limite], (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
  }

  buscarPorId(id) {
    return new Promise((resolve, reject) => {
      db.get(`SELECT * FROM frota WHERE id = ?`, [id], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });
  }

  criar(veiculo) {
    return new Promise((resolve, reject) => {
      const { id, modelo, tipo, vel, latitude, longitude } = veiculo;
      const query = `INSERT INTO frota (id, modelo, tipo, vel, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?)`;
      db.run(query, [id, modelo, tipo, vel, latitude, longitude], function (err) {
        if (err) reject(err);
        resolve({ id, modelo, tipo, vel, latitude, longitude });
      });
    });
  }

  atualizar(id, dados) {
    return new Promise((resolve, reject) => {
      const { vel, latitude, longitude } = dados;
      const query = `UPDATE frota SET vel = ?, latitude = ?, longitude = ?, ultima_atualizacao = CURRENT_TIMESTAMP WHERE id = ?`;
      db.run(query, [vel, latitude, longitude, id], function (err) {
        if (err) reject(err);
        resolve(this.changes);
      });
    });
  }

  deletar(id) {
    return new Promise((resolve, reject) => {
      db.run(`DELETE FROM frota WHERE id = ?`, [id], function (err) {
        if (err) reject(err);
        resolve(this.changes);
      });
    });
  }
}

module.exports = new FrotaRepository();
