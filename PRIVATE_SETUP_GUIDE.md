# 🚀 ShopPulse AI — Özel İç Araç (Custom App) Kurulum ve Dağıtım Rehberi

Bu rehber, ShopPulse AI'ı genel bir SaaS yerine **kendi Shopify mağazanızı veya mağazalarınızı tek bir merkezden yönetebileceğiniz özel, güvenli bir iç araç (Internal Executive Tool)** olarak dakikalar içinde canlıya almanızı sağlar.

Shopify App Store onayı, OAuth yönlendirmeleri, Stripe ödeme duvarları ve abonelik kısıtlamaları olmadan doğrudan Shopify Admin API ile çalışır.

---

## 🔑 Bölüm 1: Shopify Mağazasından Admin API Access Token Alma

Shopify, kendi mağazanızı dış sistemlere güvenle bağlamanız için resmi **"Develop Apps" (Özel Uygulama Geliştirme)** özelliğini sunar.

### Adım Adım Token Oluşturma:
1. **Shopify Yönetici Panelinize** giriş yapın: `https://admin.shopify.com/store/magaza-adiniz`
2. Sol alt köşedeki **Settings (Ayarlar)** dişli simgesine tıklayın.
3. Sol menüden **Apps and sales channels (Uygulamalar ve satış kanalları)** seçeneğine gidin.
4. Üst kısımdaki **Develop apps (Uygulama geliştir)** butonuna tıklayın.
   *(Eğer ilk kez açıyorsanız "Allow custom app development" butonuna basarak onay verin).*
5. **Create an app (Uygulama oluştur)** butonuna basın.
   - **App name:** `ShopPulse AI Private Manager` (veya dilediğiniz bir isim)
   - **App developer:** Kendi e-postanızı seçin.
6. **Configure Admin API scopes (Admin API kapsamlarını yapılandır)** butonuna tıklayın.

---

### 🛡️ İşaretlenmesi Gereken Tam Yetki Listesi (API Scopes):

ShopPulse AI'ın ciro, stok, ürün analitiği ve AI optimizasyonlarını eksiksiz çalıştırabilmesi için aşağıdaki kutucukları işaretleyin:

| Kategori | İzin Adı (Scope) | Açıklama |
| :--- | :--- | :--- |
| **Ürünler & Katalog** | `read_products` & `write_products` | Ürünleri listeleme, AI başlık/açıklama ve fiyat güncelleme |
| **Siparişler & Gelir** | `read_orders` | Güncel siparişleri ve ciro istatistiklerini çekme |
| **Geçmiş Siparişler** | `read_all_orders` | Son 90 gün ve üzeri geçmiş sipariş analitiği |
| **Stok & Envanter** | `read_inventory` & `write_inventory` | Stok tükenme hızı ve stok seviyesi alarmları |
| **Rapor & Analitik** | `read_analytics` & `read_reports` | Satış dönüşüm oranları ve performans trendleri |

> 💡 **İpucu:** Arama çubuğuna sırasıyla `products`, `orders`, `inventory`, `analytics` yazarak ilgili kutuları 30 saniyede işaretleyebilirsiniz.

7. Sağ üstteki **Save (Kaydet)** butonuna tıklayın.
8. Sayfanın en üstündeki **Install app (Uygulamayı yükle)** butonuna basın ve onaylayın.
9. **Admin API access token** alanında `shpat_` ile başlayan bir anahtar belirecektir:
   - **"Reveal token once" (Belirteci bir kez göster)** butonuna tıklayın.
   - Anahtarı kopyalayın ve güvenli bir yere kaydedin. *(⚠️ Shopify bu anahtarı güvenlik nedeniyle sadece 1 kez gösterir).*

---

## ⚡ Bölüm 2: Vercel veya Render'a Canlı Dağıtım (Deployment)

### Seçenek A: Vercel ile Dağıtım (En Kolay & En Hızlı — Önerilen)

1. GitHub hesabınızda bir repository oluşturup bu projeyi push'layın:
   ```bash
   git add .
   git commit -m "feat: private custom app mode ready"
   git push origin main
   ```
2. [Vercel](https://vercel.com) paneline gidin ve **Add New... > Project** butonuna tıklayın.
3. GitHub reponuzu seçin (**Import**).
4. **Environment Variables (Ortam Değişkenleri)** bölümüne şu 3 kritik değişkeni ekleyin:

| Değişken Adı | Değer Örneği | Açıklama |
| :--- | :--- | :--- |
| `SHOPIFY_STORE_DOMAIN` | `magazaniz.myshopify.com` | Kendi mağaza adresiniz |
| `SHOPIFY_ADMIN_API_ACCESS_TOKEN` | `shpat_xxxxxxxxxxxxxxxxxxxx` | Shopify'dan kopyaladığınız anahtar |
| `APP_PASSWORD` | `GizliYonetiC1Sifreniz2026!` | Panelinize sizden başkasının girmesini önleyen şifre |

5. **Deploy** butonuna basın. ~90 saniye içinde uygulamanız `https://shoppulse-ai.vercel.app` benzeri bir adreste canlıya çıkacaktır!

---

### Seçenek B: Render ile Dağıtım

1. [Render Dashboard](https://dashboard.render.com) > **New + > Web Service** seçin.
2. Git reponuzu bağlayın.
3. Ayarlar:
   - **Environment:** `Node`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm run start`
4. **Environment Variables** sekmesinde `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_ADMIN_API_ACCESS_TOKEN` ve `APP_PASSWORD` değişkenlerini tanımlayın.
5. **Create Web Service** butonuna basın.

---

## 🔒 Bölüm 3: Tek Kullanıcı Güvenlik Koruması (APP_PASSWORD)

Uygulamanız internete açık bir URL'de çalışacağı için panelinizi yabancı gözlerden korumak amacıyla **Single-User Master Key Koruması** yerleştirilmiştir:

1. Ortam değişkenlerinde `APP_PASSWORD` tanımlandığı anda sistemdeki tüm yollar otomatik olarak korunur.
2. Panelinize ilk girdiğinizde karşınıza şık ve minimalist bir **"Yönetici Şifresi"** doğrulama ekranı gelir.
3. Şifrenizi girdiğinizde tarayıcınıza 30 günlük güvenli oturum çerezi (`shoppulse_auth`) bırakılır ve doğrudan yönetim kokpitine yönlendirilirsiniz.
4. Şifreyi bilmeyen hiçbir ziyaretçi veya bot mağaza verilerinize, cirolarınıza veya ürünlerinize erişemez.

---

## 💎 Bölüm 4: Tüm Pro & Enterprise Özellikler Açık

Sistem doğrudan **Scale Enterprise / Özel Yönetici** modunda başlar:
- ❌ **Kaldırılanlar:** Free plan limitleri, mağaza bağlama engelleri, Stripe/Shopify ödeme modal pencereleri.
- ✅ **Varsayılan Olarak Açık Olanlar:**
  1. **AI İşletme Koçu:** Çok satan ürünler, stok tükenme riskleri ve fiyat arbitrajı aksiyonları.
  2. **BCG Ürün Matrisi:** Yıldızlar, Nakit İnekleri, Soru İşaretleri ve Zombi ürün segmentasyonu.
  3. **Rakip Radarı:** Rakip mağaza Shopify JSON/HTML scraping ve anlık fiyat kıyaslaması.
  4. **Ad Spend Sentinel:** Stokta tükenmek üzere olan ürünlerin reklamlarını koruma altyapısı.
  5. **Üst Bar:** *"Özel Mağaza • Tam Erişim"* statü rozeti.

---

## 🧪 Yerel Ortamda Test Etme (Localhost)

Bilgisayarınızda hemen çalıştırmak için proje dizininde bir `.env.local` dosyası oluşturup şu değerleri ekleyin:

```env
SHOPIFY_STORE_DOMAIN=magazaniz.myshopify.com
SHOPIFY_ADMIN_API_ACCESS_TOKEN=shpat_xxxxxxxxxxxxxxxxxxxx
APP_PASSWORD=123456
```

Ardından geliştirme sunucusunu başlatın:
```bash
npm run dev
```
Tarayıcınızda `http://localhost:3000` adresine giderek şifrenizle giriş yapın ve kendi mağazanızı yönetmeye başlayın!
