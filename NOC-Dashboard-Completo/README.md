# NOC Dashboard

## Como rodar

1. Instalar dependências (front-end + back-end, tudo no mesmo package.json):
   npm install

2. Criar/popular o banco SQLite (rodar uma vez, ou sempre que quiser resetar os dados):
   npm run migrar

3. Subir a API (deixar este terminal aberto):
   npm run server

4. Em outro terminal, subir o front-end:
   npm run dev

5. Acessar http://localhost:5173

## Testando a telemetria (Lab 5 - Parte C)

Com a API rodando, envie um PUT para simular um rastreador atualizando a posição de um veículo:

curl -X PUT http://localhost:3000/api/telemetria/V-02 \
  -H "Content-Type: application/json" \
  -d '{"latitude":"-12.9700","longitude":"-38.5000","vel":"90"}'

Dê F5 no dashboard: a velocidade, o horário de Sync e o link do Google Maps do veículo V-02 vão refletir a nova posição (Salvador).
