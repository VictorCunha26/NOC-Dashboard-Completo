# NOC Dashboard

## Arquitetura do back-end (Lab 6)

O back-end (`backend/src`) segue arquitetura em camadas:

- `config/` — conexão SQLite (`database.js`) e carga de dados (`seed.js`)
- `repositories/` — acesso ao banco (`frotaRepository.js`, `infraRepository.js`)
- `controllers/` — regras de negócio e status codes HTTP (`frotaController.js`, `infraController.js`)
- `routes/` — endpoints REST (`frotaRoutes.js`, `infraRoutes.js`)
- `server.js` — inicialização do Express

## Como rodar

1. Instalar dependências (front-end + back-end, tudo no mesmo package.json):
   npm install

2. Gerar a carga de Big Data no SQLite (100.000 veículos, via transação SQL — rodar uma vez, ou sempre que quiser resetar os dados):
   npm run seed
   (alias antigo `npm run migrar` continua funcionando)

3. Subir a API (deixar este terminal aberto):
   npm run server

4. Em outro terminal, subir o front-end:
   npm run dev

5. Acessar http://localhost:5173

## CRUD completo da frota (Lab 6)

Com a API rodando (`npm run server`), teste os endpoints em `http://localhost:3000/api/frota`:

- `GET /api/frota` — lista uma amostra aleatória protegida contra o volume total (limite padrão: 500; use `?limite=N` para ajustar)
- `GET /api/frota/:id` — busca um veículo específico (ex: `V-050000`)
- `POST /api/frota` — cria um veículo (`id` e `tipo` obrigatórios no body)
- `PUT /api/frota/:id` — atualiza telemetria (`vel`, `latitude`, `longitude`)
- `DELETE /api/frota/:id` — remove um veículo

Exemplo de atualização direta (comprova a escalabilidade — varredura por ID em meio a 100.000 registros):

curl -X PUT http://localhost:3000/api/frota/V-050000 \
  -H "Content-Type: application/json" \
  -d '{"latitude":"-12.9700","longitude":"-38.5000","vel":"90"}'

O endpoint `PUT /api/telemetria/:id` (Lab 5) continua funcionando por compatibilidade, apontando para a mesma lógica.

## Endpoint agregado do dashboard

`GET /api/dados` continua existindo para o front-end: reúne infraestrutura, a base do NOC e uma amostra da frota (limite de 500) numa única resposta.
