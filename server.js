import { WebSocketServer } from 'ws';

const PORT = process.env.PORT || 3000;
const wss = new WebSocketServer({ port: PORT });

console.log(`✅ WebSocket サーバー起動中... (ws://localhost:${PORT})`);

const symbols = [
  { name: 'BTC', url: 'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT' },
  { name: 'ETH', url: 'https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT' },
  { name: 'ADA', url: 'https://api.binance.com/api/v3/ticker/price?symbol=ADAUSDT' },
  { name: 'XRP', url: 'https://api.binance.com/api/v3/ticker/price?symbol=XRPUSDT' },
  { name: 'SOL', url: 'https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT' }
];

async function fetchPrices() {
  const results = {};
  for (const symbol of symbols) {
    try {
      const res = await fetch(symbol.url);  // ← node-fetch ではなく標準 fetch を使う
      const data = await res.json();
      results[symbol.name] = parseFloat(data.price);
    } catch (err) {
      console.error(`❌ ${symbol.name} の取得に失敗しました`);
      console.error(err);  // 詳細エラー出力
    }
  }
  return results;
}

setInterval(async () => {
  const prices = await fetchPrices();
  const message = JSON.stringify(prices);
  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(message);
    }
  });
  console.log('📡 送信データ:', prices);
}, 8000);
