/**
 * ShopPulse AI — Shopify Token Alma & Otomatik Kurulum Aracı
 *
 * Kullanım:
 *   node scripts/get-token.js
 * veya parametrelerle:
 *   node scripts/get-token.js <storeDomain> <clientId> <clientSecret>
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const defaultStore = process.env.SHOPIFY_STORE_DOMAIN || '7dyz3u-i1.myshopify.com';
const defaultClientId = process.env.SHOPIFY_CLIENT_ID || '';
const defaultClientSecret = process.env.SHOPIFY_CLIENT_SECRET || '';

const storeDomain = (process.argv[2] || defaultStore).replace(/^https?:\/\//, '').replace(/\/$/, '');
const clientId = process.argv[3] || defaultClientId;
const clientSecret = process.argv[4] || defaultClientSecret;

if (!clientId || !clientSecret) {
  console.log('\n❌ Lütfen Client ID ve Client Secret bilgilerini parametre olarak girin:');
  console.log('   Kullanım: node scripts/get-token.js <storeDomain> <clientId> <clientSecret>');
  console.log('   Örnek:    node scripts/get-token.js 7dyz3u-i1.myshopify.com 32_karakter_client_id shpss_secret_buraya\n');
  process.exit(1);
}

const SCOPES = [
  'read_products',
  'write_products',
  'read_orders',
  'read_all_orders',
  'read_inventory',
  'write_inventory',
  'read_analytics',
  'read_reports',
].join(',');

const PORT = 3456;
const REDIRECT_URI = `http://localhost:${PORT}/callback`;

console.log('\n=============================================================');
console.log('⚡ ShopPulse AI — Shopify Admin Access Token Edinme Aracı');
console.log('=============================================================');
console.log(`🏪 Mağaza:        ${storeDomain}`);
console.log(`🆔 Client ID:     ${clientId} (${clientId.length} karakter)`);
console.log(`🔑 Client Secret: ${clientSecret.substring(0, 10)}...`);

if (clientId.length !== 32) {
  console.warn(`\n⚠️  UYARI: Shopify Client ID standart olarak 32 karakterdir.`);
  console.warn(`    Girdiğiniz Client ID (${clientId}) ${clientId.length} karakter.`);
  console.warn(`    Eğer 400 'application_cannot_be_found' hatası alırsanız,`);
  console.warn(`    Shopify Partners > Apps > App setup > Client credentials kısmından`);
  console.warn(`    Client ID'yi tam olarak kopyaladığınızdan emin olun.`);
}

function saveTokenToEnv(token) {
  const envPath = path.join(process.cwd(), '.env.local');
  let content = '';
  if (fs.existsSync(envPath)) {
    content = fs.readFileSync(envPath, 'utf-8');
  }

  const updateOrAdd = (key, value) => {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(content)) {
      content = content.replace(regex, `${key}="${value}"`);
    } else {
      content += `\n${key}="${value}"`;
    }
  };

  updateOrAdd('SHOPIFY_STORE_DOMAIN', storeDomain);
  updateOrAdd('SHOPIFY_ADMIN_API_ACCESS_TOKEN', token);
  updateOrAdd('SHOPIFY_CLIENT_ID', clientId);
  updateOrAdd('SHOPIFY_CLIENT_SECRET', clientSecret);

  fs.writeFileSync(envPath, content.trim() + '\n');
  console.log(`\n💾 Token başarıyla .env.local dosyasına kaydedildi!`);
}

// 1. YOL: Client Credentials Grant (Özellikle Dev Mağazalar için Direkt API Token Değişimi)
async function tryClientCredentials() {
  console.log('\n[1/2] Client Credentials Grant yöntemi test ediliyor...');
  try {
    const res = await fetch(`https://${storeDomain}/admin/oauth/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }).toString(),
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok && data.access_token) {
      console.log('\n🎉 BAŞARILI! Doğrudan Access Token alındı!');
      console.log('🔑 Access Token:', data.access_token);
      console.log('📋 Yetki Kapsamı (Scopes):', data.scope || 'Tümü');
      saveTokenToEnv(data.access_token);
      return;
    } else {
      console.log(`ℹ️  Client Credentials yanıtı: [${res.status}] ${data.error || ''} - ${data.error_description || ''}`);
    }
  } catch (err) {
    console.log('ℹ️  Client Credentials denenirken hata:', err.message);
  }

  // Eğer 1. yol olmadıysa OAuth sunucusunu başlat
  startOAuthServer();
}

// 2. YOL: Yerel 1-Tıkla OAuth Web Sunucusu
function startOAuthServer() {
  console.log('\n[2/2] 1-Tıkla OAuth Yetkilendirme Sunucusu Başlatılıyor...');

  const authUrl = `https://${storeDomain}/admin/oauth/authorize?client_id=${clientId}&scope=${encodeURIComponent(
    SCOPES
  )}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=shoppulse_${Date.now()}`;

  const server = http.createServer(async (req, res) => {
    const reqUrl = new URL(req.url, `http://localhost:${PORT}`);

    if (reqUrl.pathname === '/callback') {
      const code = reqUrl.searchParams.get('code');
      const error = reqUrl.searchParams.get('error');

      if (error) {
        res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<h2>❌ Yetkilendirme Reddedildi:</h2><p>${error}</p>`);
        return;
      }

      if (!code) {
        res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<h2>❌ Yetkilendirme Kodu (code) Bulunamadı</h2>`);
        return;
      }

      console.log('\n📥 Yetkilendirme kodu (code) alındı! Shopify ile token değişimi yapılıyor...');

      try {
        const tokenRes = await fetch(`https://${storeDomain}/admin/oauth/access_token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
          },
          body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            code: code,
          }).toString(),
        });

        const tokenData = await tokenRes.json().catch(() => ({}));

        if (tokenRes.ok && tokenData.access_token) {
          console.log('\n🎉 TEBRİKLER! Shopify Admin Access Token başarıyla alındı!');
          console.log('=============================================================');
          console.log(`🔑 Token:  ${tokenData.access_token}`);
          console.log(`📋 Scope:  ${tokenData.scope || SCOPES}`);
          console.log('=============================================================');

          saveTokenToEnv(tokenData.access_token);

          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(`
            <body style="background:#09090b;color:#fafafa;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
              <div style="max-width:480px;text-align:center;padding:32px;background:#121215;border:1px solid rgba(255,255,255,0.1);border-radius:16px;">
                <h1 style="color:#10b981;margin-bottom:8px;">✅ Bağlantı Başarılı!</h1>
                <p style="color:#a1a1aa;font-size:14px;margin-bottom:20px;">Shopify Admin Access Token alındı ve <code>.env.local</code> dosyasına kaydedildi.</p>
                <div style="background:#18181b;padding:12px;border-radius:8px;font-family:monospace;font-size:12px;word-break:break-all;color:#e4e4e7;border:1px solid rgba(255,255,255,0.06);">
                  ${tokenData.access_token}
                </div>
                <p style="color:#71717a;font-size:12px;margin-top:20px;">Bu sekmeyi kapatabilir ve ShopPulse AI panelinize dönebilirsiniz.</p>
              </div>
            </body>
          `);

          setTimeout(() => {
            console.log('\nSunucu kapatılıyor. ShopPulse AI uygulamanızı kullanabilirsiniz!');
            server.close();
            process.exit(0);
          }, 2000);
        } else {
          console.error('❌ Token değişimi başarısız oldu:', tokenData);
          res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(`<h2>❌ Token Alınamadı:</h2><pre>${JSON.stringify(tokenData, null, 2)}</pre>`);
        }
      } catch (err) {
        console.error('❌ İstek hatası:', err);
        res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<h2>İstek Hatası:</h2><p>${err.message}</p>`);
      }
    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
  });

  server.listen(PORT, () => {
    console.log(`\n🌐 Yerel Dinleyici Aktif: http://localhost:${PORT}`);
    console.log('\n👉 LÜTFEN ŞU 2 ADIMI TAKİP EDİN:');
    console.log('-------------------------------------------------------------');
    console.log(`1. Shopify Partners Dashboard > Apps > [Uygulamanız] > App setup`);
    console.log(`   bölümünde 'Allowed redirection URL(s)' alanına şu URL'i ekleyin:`);
    console.log(`   👉 \x1b[36m${REDIRECT_URI}\x1b[0m`);
    console.log('');
    console.log(`2. Ardından şu linki tarayıcınızda açın ve mağazanıza yükleyin:`);
    console.log(`   👉 \x1b[32m${authUrl}\x1b[0m`);
    console.log('-------------------------------------------------------------');
    console.log('⏳ Tarayıcıdan yetkilendirme bekleniyor...\n');
  });
}

tryClientCredentials();
