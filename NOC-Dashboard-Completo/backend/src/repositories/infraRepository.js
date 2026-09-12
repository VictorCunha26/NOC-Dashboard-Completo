// backend/src/repositories/infraRepository.js
const db = require('../config/database');

class InfraRepository {
  listarTodos() {
    return new Promise((resolve, reject) => {
      db.all(`SELECT * FROM infraestrutura WHERE id > 0`, [], (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
  }

  buscarBaseNoc() {
    return new Promise((resolve, reject) => {
      db.get(`SELECT latitude, longitude FROM infraestrutura WHERE id = 0`, [], (err, row) => {
        if (err) reject(err);
        resolve(row || {});
      });
    });
  }
}

module.exports = new InfraRepository();
