import fetch from 'node-fetch';
import { WebSocketServer } from 'ws';

const PORT = process.env.PORT || 10000;
const wss = new WebSocketServer({ port: PORT });

console.log(`✅ WebSocket サーバー起動中... (ws://localhost:${PORT})`);

// CoinGeckoで使用するコインIDと表示名の対応
const symbolMap = {
  bitcoin: 'BTC',
  ethereum: 'ETH',
  cardano: 'ADA',
  ripple: 'XRP',
  solana: 'SOL'
};

const apiUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,cardano,ripple,solana&vs_currencies=usd';

async function fetchPrices() {
  const results = {};
  try {
    const res = await fetch(apiUrl);
    if (!res.ok) {
      throw new Error(`HTTPエラー: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();

    for (const [coinId, priceData] of Object.entries(data)) {
      const symbol = symbolMap[coinId];
      results[symbol] = priceData.usd;
    }
  } catch (err) {
    console.error('❌ 価格取得に失敗しました:', err.message);
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
