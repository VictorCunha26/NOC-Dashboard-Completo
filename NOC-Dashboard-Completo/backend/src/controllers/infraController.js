// backend/src/controllers/infraController.js
const infraRepository = require('../repositories/infraRepository');

class InfraController {
  async listar(req, res) {
    try {
      const infraestrutura = await infraRepository.listarTodos();
      const noc = await infraRepository.buscarBaseNoc();
      res.status(200).json({ infraestrutura, noc });
    } catch (error) { res.status(500).json({ erro: 'Erro ao consultar infraestrutura.' }); }
  }
}

module.exports = new InfraController();
