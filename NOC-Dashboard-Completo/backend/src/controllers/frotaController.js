// backend/src/controllers/frotaController.js
const frotaRepository = require('../repositories/frotaRepository');

class FrotaController {
  async listar(req, res) {
    try {
      const limite = Number(req.query.limite) || 500;
      // O controlador solicita apenas uma amostra limitada dos 100.000 disponíveis
      const veiculos = await frotaRepository.listarTodos(limite);
      res.status(200).json(veiculos);
    } catch (error) { res.status(500).json({ erro: 'Erro interno no servidor.' }); }
  }

  async buscarDetalhes(req, res) {
    try {
      const veiculo = await frotaRepository.buscarPorId(req.params.id);
      if (!veiculo) return res.status(404).json({ mensagem: 'Veículo não encontrado.' });
      res.status(200).json(veiculo);
    } catch (error) { res.status(500).json({ erro: 'Falha na busca.' }); }
  }

  async registrar(req, res) {
    try {
      if (!req.body.id || !req.body.tipo) return res.status(400).json({ erro: 'ID e Tipo são obrigatórios.' });
      const novoVeiculo = await frotaRepository.criar(req.body);
      res.status(201).json(novoVeiculo);
    } catch (error) { res.status(500).json({ erro: 'Erro ao inserir. ID duplicado?' }); }
  }

  async atualizarTelemetria(req, res) {
    try {
      const linhasAfetadas = await frotaRepository.atualizar(req.params.id, req.body);
      if (linhasAfetadas === 0) return res.status(404).json({ mensagem: 'Veículo inexistente.' });
      res.status(200).json({ mensagem: 'Telemetria atualizada.' });
    } catch (error) { res.status(500).json({ erro: 'Erro no Update SQL.' }); }
  }

  async remover(req, res) {
    try {
      const linhasAfetadas = await frotaRepository.deletar(req.params.id);
      if (linhasAfetadas === 0) return res.status(404).json({ mensagem: 'Veículo inexistente.' });
      res.status(204).send();
    } catch (error) { res.status(500).json({ erro: 'Falha ao deletar.' }); }
  }
}

module.exports = new FrotaController();
