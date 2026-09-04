// Sistema centralizado de eventos Server-Sent Events (SSE) en tiempo real
let sseClients = [];

function addClient(client) {
  sseClients.push(client);
}

function removeClient(clientId) {
  sseClients = sseClients.filter(c => c.id !== clientId);
}

function broadcastEvent(eventType, payload) {
  const data = JSON.stringify({ type: eventType, data: payload, timestamp: Date.now() });
  sseClients.forEach(client => {
    try {
      client.res.write(`data: ${data}\n\n`);
    } catch (err) {
      // Ignorar fallos en clientes desconectados
    }
  });
}

module.exports = { addClient, removeClient, broadcastEvent };
