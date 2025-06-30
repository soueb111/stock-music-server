const WebSocket = require('ws');
const fetch = require('node-fetch');

const wss = new WebSocket.Server({ port: 8080 });

console.log('✅ WebSocket サーバー起動中... (ws://localhost:8080)');

const symbols = [
  { name: 'BTC', url: 'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT' },
  { name: 'ETH', url: 'https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT' },
  { name: 'ADA', url: 'https://api.binance.com/api/v3/ticker/price?symbol=ADAUSDT' },
  { name: 'XRP', url: 'https://api.binance.com/api/v3/ticker/price?symbol=XRPUSDT' },
  { name: 'SOL', url: 'https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT' },
];

async function fetchPrices() {
  const results = {};
  for (const symbol of symbols) {
    try {
      const res = await fetch(symbol.url);
      const data = await res.json();
      results[symbol.name] = parseFloat(data.price);
    } catch (err) {
      console.error(`❌ ${symbol.name} の取得に失敗しました`);
    }
  }
  return results;
}

setInterval(async () => {
  const prices = await fetchPrices();
  const message = JSON.stringify(prices);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
  console.log('📡 送信データ:', prices);
}, 8000);
