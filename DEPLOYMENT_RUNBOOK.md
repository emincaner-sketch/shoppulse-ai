# ShopPulse AI — Production Deployment & Launch Runbook 🚀

Bu doküman, **ShopPulse AI** SaaS uygulamasının Vercel, Supabase/Neon PostgreSQL, Shopify Partner Dashboard ve Stripe altyapıları üzerinde sıfırdan canlıya (production) alınması için adım adım rehberdir.

---

## 📋 1. MİMARİ VE GEREKSİNİMLER

- **Frontend & Edge API:** Vercel (Next.js 14+ App Router, Node.js 20 LTS)
- **Veritabanı:** Supabase veya Neon (PostgreSQL 15+ ile PgBouncer Bağlantı Havuzlaması)
- **Token Şifreleme:** AES-256-GCM Kriptografik Kasa (`src/lib/crypto.ts`)
- **Shopify Platformu:** Shopify Partner Dashboard (GraphQL Admin API, Embedded App Bridge)
- **Faturalama:** Shopify App Billing API (GraphQL `appSubscriptionCreate`) & Stripe Billing

---

## 🗄️ 2. VERİTABANI KURULUMU (SUPABASE / NEON POSTGRESQL)

1. [Supabase](https://supabase.com) veya [Neon](https://neon.tech) üzerinde yeni bir PostgreSQL projesi oluşturun (`shoppulse-ai-prod`).
2. **Bağlantı Dizelerini Alın:**
   - **`DATABASE_URL` (PgBouncer Havuzlu - Port 6543):** Serverless Next.js fonksiyonlarının veritabanı bağlantı sınırına takılmaması için havuzlu dizeyi kullanın.
     ```env
     DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
     ```
   - **`DIRECT_URL` (Doğrudan Bağlantı - Port 5432):** Prisma migrasyonları ve tablo şeması güncellemeleri için doğrudan portu kullanın.
     ```env
     DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
     ```
3. **Veritabanı Şemasını Basın (Migration):**
   ```bash
   npm run db:push
   # veya kalıcı migrasyon için:
   npx prisma migrate deploy
   ```
4. **Seed Verisini Yükleyin (Opsiyonel):**
   ```bash
   npx prisma db seed
   ```

---

## ☁️ 3. VERCEL SERVERLESS DAĞITIMI

1. [Vercel](https://vercel.com) paneline gidin -> **Add New...** -> **Project**.
2. GitHub / GitLab deponuzu bağlayın.
3. **Framework Preset:** `Next.js`
4. **Build & Development Settings:**
   - Build Command: `npm run build:prod`
   - Output Directory: `.next`
5. **Environment Variables (Ortam Değişkenleri):**
   Aşağıdaki değerleri `.env.example` dosyasından kopyalayarak Vercel Environment Variables bölümüne ekleyin:

| Değişken Adı | Açıklama | Örnek Değer |
|---|---|---|
| `DATABASE_URL` | PgBouncer havuzlu PostgreSQL bağlantısı | `postgresql://...@pooler.supabase.com:6543/...` |
| `DIRECT_URL` | Doğrudan PostgreSQL bağlantısı (Migrasyonlar için) | `postgresql://...@pooler.supabase.com:5432/...` |
| `ENCRYPTION_SECRET_KEY` | AES-256-GCM token şifreleme anahtarı | 64 karakterli rastgele hex dizesi |
| `SHOPIFY_API_KEY` | Shopify Partner App Client ID | `shpa_xxxxxxxxxxxxxxxx` |
| `SHOPIFY_API_SECRET` | Shopify Partner App Secret Key | `shpss_xxxxxxxxxxxxxxxx` |
| `SHOPIFY_APP_URL` | Canlı Vercel domain adresi | `https://app.shoppulse.ai` |
| `STRIPE_SECRET_KEY` | Stripe Live Secret Key | `sk_live_51...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook İmza Anahtarı | `whsec_...` |
| `OPENAI_API_KEY` | (Opsiyonel) GPT-4o API Anahtarı | `sk-proj-...` |
| `ANTHROPIC_API_KEY` | (Opsiyonel) Claude 3.5 Sonnet Anahtarı | `sk-ant-api03-...` |
| `NEXT_PUBLIC_APP_URL` | Genel Uygulama URL'i | `https://app.shoppulse.ai` |

6. **Deploy** butonuna basarak canlı derlemeyi başlatın.

---

## 🛍️ 4. SHOPIFY PARTNER DASHBOARD YAPILANDIRMASI

1. [Shopify Partner Dashboard](https://partners.shopify.com) -> **Apps** -> **Create App** -> **Create app manually**.
2. **App Name:** `ShopPulse AI — Shopify Growth Manager`
3. **App URL & Redirection URLs:**
   - **App URL:** `https://app.shoppulse.ai`
   - **Allowed redirection URL(s):**
     - `https://app.shoppulse.ai/api/shopify/callback`
     - `https://app.shoppulse.ai/api/shopify/auth`
4. **Embedded App & CSP Doğrulaması:**
   - Shopify Admin içinde gömülü (embedded) çalışması için `App Bridge` ayarlarını açın.
   - `next.config.ts` içinde `frame-ancestors https://*.myshopify.com https://admin.shopify.com` başlığı aktif edilmiştir.
5. **Zorunlu GDPR Webhook Rotaları:**
   - `Customer data request:` `https://app.shoppulse.ai/api/shopify/webhooks`
   - `Customer data erasure:` `https://app.shoppulse.ai/api/shopify/webhooks`
   - `Shop data erasure:` `https://app.shoppulse.ai/api/shopify/webhooks`
6. **Yasal Sayfalar:**
   - **Privacy Policy URL:** `https://app.shoppulse.ai/privacy`
   - **Terms of Service URL:** `https://app.shoppulse.ai/terms`

---

## 💳 5. STRIPE CANLI ÖDEME YAPILANDIRMASI

1. [Stripe Dashboard](https://dashboard.stripe.com) -> **Developers** -> **Webhooks** -> **Add destination**.
2. **Endpoint URL:** `https://app.shoppulse.ai/api/billing/webhook`
3. **Dinlenecek Olaylar (Events):**
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Elde edilen `whsec_...` anahtarını Vercel'deki `STRIPE_WEBHOOK_SECRET` alanına kaydedin.

---

## 🩺 6. DAĞITIM SONRASI SAĞLIK KONTROLÜ (SMOKE TEST)

Dağıtım tamamlandıktan sonra aşağıdaki kontrolleri uygulayın:

1. **Sistem Sağlık Endpoint'i:**
   ```bash
   curl -i https://app.shoppulse.ai/api/health
   ```
   *Beklenen Yanıt:* HTTP 200 `{ "status": "healthy", "database": { "status": "connected" }, "security": { "aes256GcmTokenVault": "active" } }`

2. **Gizlilik ve Şartlar Sayfaları:**
   - `https://app.shoppulse.ai/privacy`
   - `https://app.shoppulse.ai/terms`

3. **Shopify OAuth Testi:**
   - Test mağazasında Shopify App URL'ini açarak OAuth izin onayını verin ve mağazanın otomatik senkronizasyonunun (`/api/stores/sync`) tetiklendiğini teyit edin.
