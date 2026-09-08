import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/gemini';

/**
 * /api/ai/chat — Dedicated conversational AI endpoint for ShopPulse AI Assistant.
 * Sends user prompt with full Nightfold store context to Gemini for dynamic responses.
 */

const SYSTEM_PROMPT = `
Sen ShopPulse AI — DTC markası Nightfold (nightfold.store) için Kıdemli E-Ticaret Direktörü ve Büyüme Stratejistisin (Senior E-Commerce Director & Growth Strategist).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ROL & MAĞAZA BAĞLAMI:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Mağaza: Nightfold (nightfold.store)
- Hero Ürün: Nightfold DeepRest 3D Konturlu Uyku Maskesi
  • Temel Özellikler: %100 Zifiri Karanlık (Total Blackout), Derin 3D Göz Yuvaları (Sıfır Kirpik Baskısı / Lash Extension Safe), Hafızalı Sünger (Memory Foam), Nefes Alabilir Soğutucu İpek Karışım Kumaş.
- Fiyatlandırma:
  • Birim Satış Fiyatı: $34.99
  • Duo Bundle Teklifi: $59.00 (2 Adet Maske — AOV yükseltici birincil teklif)
- Envanter Durumu: Depoda 36.714 Adet hazır stok (Yaklaşık $1.28M Envanter Hacmi).
- Mevcut Durum: Soğuk lansman (Cold Launch — 0 satış) fazı.
- Temel Stratejik Hedef: İlk satışı gerçekleştirmek ve ilk 100 siparişi kârlı/sürdürülebilir birim ekonomisiyle yakalamak.
- Doğrudan Rakip: Manta Sleep PRO ($39.99) — Nightfold $5.00 net fiyat arbitrajı avantajına ve üstün 3D ergonomiye sahiptir.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2026 META & DTC ALGORİTMA VE STRATEJİ İLKELERİ:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. KAMPANYA MİMARİSİ (2026 Meta Reklam Yapısı):
   - Kreatif Test Fazı: Yeni kreatif ve kanca testleri için Manuel Bütçeleme / Reklam Seti Bütçesi (ABO - Ad Set Budget Optimization) mantığını kullan. Değişkenleri (kanca, görsel formatı, metin açısı) izole ederek bütçeyi adil dağıt.
   - Kazananları Ölçekleme: Test fazında tutunup kazanan kreatifleri Advantage+ Campaign Budget (eski CBO) ve Advantage+ Sales Campaigns (eski ASC / Advantage+ Shopping) yapılarına taşıyarak ölçekle.
   - Öğrenme Fazı (Learning Phase): "Haftada 50 dönüşüm" gibi öğrenme fazı eşiklerini dogmatik/mutlak görme; Ads Manager arayüzündeki anlık öğrenme durumunu ve teslimat sinyallerini kullanıcıya doğrulat.

2. KREATİF & AI İÇERİK UYUMLULUĞU:
   - İlk 3 Saniye Kancası (Thumbstop Rate): Soğuk trafik dönüşümünün anahtarıdır. Nightfold için 1 numaralı kanca: "Karanlık Odada Telefon Flaşı Testi (%100 Blackout kanıtı — kumaşa arkadan flaş tutulduğunda 0 lümen ışık sızması)".
   - AI Üretimi İçerik Uyarısı (Meta AI Disclosure): Eğer kreatiflerde AI tarafından üretilmiş fotogerçekçi modeller/kullanıcılar veya avatar UGC'leri kullanılıyorsa, Meta Ads Manager'da "Yapay Zeka İçeriği / AI-generated content" etiketinin/açıklamasının MUTLAKA açılmasını hatırlat. Bu etiketin ihmal edilmesi durumunda algoritmanın 'sessiz dağıtım kısıtlaması' (silent distribution throttling / shadow suppression) uygulayabileceğini vurgula.

3. BİRİM İKTİSADI (UNIT ECONOMICS) & 2026 DE MINIMIS UYARISI:
   - Net Katkı Payı (Net Contribution Margin) Formülü:
     Net Katkı Payı = AOV - (COGS + Kargo + İşlem Ücreti + Gümrük/Tarife)
   - 2026 De Minimis & Gümrük Uyarısı: Uluslararası veya Çin tedarikli doğrudan gönderimlerde (direct fulfillment / dropshipping), 2026 De Minimis muafiyet eşiği düzenlemelerini ve potansiyel gümrük/tarife maliyetlerini kârlılık ve başabaş (break-even ROAS) hesaplamalarına mutlaka dahil et.
   - AOV Güvenliği: $34.99 tekil satış yerine $59.00 Duo Bundle teklifiyle sepet ortalamasını büyüterek müşteri edinme maliyetini (CAC) güvenle sübvanse et.

4. ÖLÇÜM VE HESAP SAĞLIĞI (ACCOUNT HEALTH):
   - Olay Eşleme Kalitesi (EMQ): Meta CAPI / Pixel için ~6/10 puanını soğuk lansman aşamasında yeterli kabul et. 6/10 üzerindeki marjinal teknik takıntılar yerine zaman ve bütçeyi kreatif testlerine ve teklif optimizasyonuna yönlendir.
   - Müşteri Geri Bildirim Skoru (CFS) Güncellemesi: Eski CFS skoru Meta arayüzünden kaldırıldığı için; hesap sağlığını doğrudan iade oranları, kargo teslimat süreleri ve müşteri şikayet sinyalleri üzerinden dahili panoda takip etmeyi öner.
   - Etik Dönüşüm Psikolojisi: Sahte kıtlık sayaçları ("Son 3 ürün kaldı!") veya temelsiz aciliyet sayaçları kullanmaktan kaçın. Meta'nın yanıltıcı ticaret politikalarına takılmamak için depodaki gerçek envanter gücüne (36.714 adet) ve somut video kanıtlarına odaklan.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YANIT KURALLARI & FORMAT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Dil: Her zaman akıcı, profesyonel ve iş odaklı Türkçe yanıt ver (kullanıcı özellikle İngilizce istemedikçe).
- Format: Net, maddeli, doğrudan aksiyon odaklı, paragraflara boğulmamış ve yüksek bilgi yoğunluğuna sahip olsun.
- Rasyonel & Veriye Dayalı: Önerilerini matematiksel DTC verilerine (AOV, katkı payı, bütçe, ROAS, envanter hacmi) dayandır.
- Teşhis & Aksiyon: Problemi doğrudan tespit et ve hemen uygulanabilir 1-2-3 adımlı aksiyon listesi sun.
`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, language = 'tr', conversationHistory = [] } = body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // 1. Attempt Gemini API
    const gemini = getGeminiClient();
    if (gemini) {
      try {
        // Build conversation context from history
        let historyContext = '';
        if (conversationHistory.length > 0) {
          const recentHistory = conversationHistory.slice(-6); // Last 3 exchanges
          historyContext = '\nGEÇMİŞ KONUŞMA BAĞLAMI:\n' + recentHistory.map((msg: any) =>
            `${msg.role === 'user' ? 'Kullanıcı' : 'ShopPulse AI'}: ${msg.text}`
          ).join('\n') + '\n';
        }

        const response = await gemini.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `${SYSTEM_PROMPT}
${historyContext}
Kullanıcı Dili: ${language === 'tr' ? 'Türkçe' : 'English'}.
Kullanıcı Sorusu: "${prompt}"
`,
          config: {
            temperature: 0.4,
            maxOutputTokens: 1000,
          },
        });

        const replyText = response.text;
        if (replyText && replyText.trim().length > 0) {
          return NextResponse.json({
            success: true,
            reply: replyText.trim(),
            provider: 'google-genai',
            model: 'gemini-2.5-flash',
            isLiveAi: true,
          });
        }
      } catch (err) {
        console.warn('[AI Chat] Gemini call failed, trying fallback providers:', err);
      }
    }

    // 2. Fallback: OpenAI
    const openAiKey = process.env.OPENAI_API_KEY;
    if (openAiKey) {
      try {
        const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${openAiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              {
                role: 'system',
                content: `${SYSTEM_PROMPT}\nYanıt Dili: ${language === 'tr' ? 'Türkçe' : 'English'}.`,
              },
              { role: 'user', content: prompt },
            ],
            max_tokens: 800,
          }),
        });

        if (openAiRes.ok) {
          const data = await openAiRes.json();
          const replyText = data.choices?.[0]?.message?.content;
          if (replyText) {
            return NextResponse.json({
              success: true,
              reply: replyText.trim(),
              provider: 'openai',
              model: 'gpt-4o',
              isLiveAi: true,
            });
          }
        }
      } catch (err) {
        console.warn('[AI Chat] OpenAI fallback failed:', err);
      }
    }

    // 3. Fallback: Anthropic
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (anthropicKey) {
      try {
        const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': anthropicKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 800,
            system: `${SYSTEM_PROMPT}\nYanıt Dili: ${language === 'tr' ? 'Türkçe' : 'English'}.`,
            messages: [{ role: 'user', content: prompt }],
          }),
        });

        if (anthropicRes.ok) {
          const data = await anthropicRes.json();
          const replyText = data.content?.[0]?.text;
          if (replyText) {
            return NextResponse.json({
              success: true,
              reply: replyText.trim(),
              provider: 'anthropic',
              model: 'claude-3.5-sonnet',
              isLiveAi: true,
            });
          }
        }
      } catch (err) {
        console.warn('[AI Chat] Anthropic fallback failed:', err);
      }
    }

    // 4. Final fallback: Intelligent 2026 DTC Growth Engine Heuristic
    return NextResponse.json({
      success: true,
      reply: generateHeuristicReply(prompt, language),
      provider: 'nightfold-heuristics-2026',
      model: 'meta-dtc-growth-engine-2026',
      isLiveAi: false,
    });
  } catch (error: any) {
    console.error('[AI Chat Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'AI chat processing failed' },
      { status: 500 }
    );
  }
}

/**
 * 2026 Meta Ads & DTC Heuristic Engine with Unit Economics Intelligence
 */
function generateHeuristicReply(prompt: string, language: string): string {
  const lower = prompt.toLowerCase();

  // 1. DÖNÜŞÜM & SİPARİŞ / SATIŞ
  if (lower.includes('dönüşüm') || lower.includes('conversion') || lower.includes('satış') || lower.includes('order') || lower.includes('sipariş') || lower.includes('ilk')) {
    return language === 'tr'
      ? `📊 **Nightfold Büyüme Teşhisi — İlk Satış & İlk 100 Sipariş Yol Haritası**

Mağazada **36.714 adet stok ($1.28M hacim)** hazır ancak henüz soğuk lansman (0 sipariş) aşamasındasınız. Problem ürün veya fiyatta değil; soğuk trafik hunisinde kanıt temelli kanca eksikliğinde.

🎯 **2026 Doğrudan Aksiyon Planı:**
• **1 Numaralı Kanca Devreye Alın:** 3 saniyelik "Karanlık Odada Telefon Flaşı Testi" (%100 Blackout kanıtı) videosunu ürün sayfası üst bandına ve reklamlara yerleştirin.
• **Duo Bundle Teklifi ($59.00):** $34.99 tekil satış yerine "2 Adet Al $59 Öde" paketini öne çıkararak AOV'yi yükseltin ve CAC baskısını absorbe edin.
• **İlk 100 Sipariş Karşılama İndirimi:** Çıkış niyetli (exit-intent) %15 hoş geldin pop-up'ı tanımlayın.
• **Güven & Etik Dönüşüm:** Sahte kıtlık sayaçları yerine gerçek 36.714 adetlik depo güvenini ve 30 gün para iade garantisini vurgulayın.

Bu hamleler sepet tamamlama oranını anında %25-30 bandında yukarı çekecektir.`
      : `📊 **Nightfold Growth Diagnosis — Path to First Sale & First 100 Orders**

Warehouse holds **36,714 units ($1.28M inventory volume)**, currently at cold launch (0 orders). Bottleneck is not product quality or pricing, but missing proof hooks in cold traffic.

🎯 **2026 Action Plan:**
• **Deploy #1 Proof Hook:** 3-second "Flashlight in Dark Room Test" (100% Blackout proof) on product hero & ads.
• **Duo Bundle Offer ($59.00):** Feature the 2-pack bundle to lift AOV and absorb cold acquisition CAC.
• **Welcome Exit-Intent:** 15% discount pop-up for the first 100 buyers.
• **Ethical Scarcity:** Replace fake countdowns with verified warehouse stock backing and 30-night trial.`;
  }

  // 2. KAMPANYA MİMARİSİ / REKLAM / META 2026 / BÜTÇE
  if (lower.includes('reklam') || lower.includes('meta') || lower.includes('kampanya') || lower.includes('bütçe') || lower.includes('budget') || lower.includes('ads') || lower.includes('abo') || lower.includes('cbo') || lower.includes('asc')) {
    return language === 'tr'
      ? `📈 **2026 Meta Reklam Mimarisi & Bütçe Stratejisi**

Nightfold DeepRest için soğuk lansmandan ölçeklemeye geçiş yapısı:

1️⃣ **Kreatif Test Fazı (Manuel / ABO):**
• Yeni kanca ve kreatifleri test ederken bütçeyi Ad Set düzeyinde (ABO) tutun.
• Reklam seti başına günlük $20-$25 bütçeyle 3 farklı kanca (Flaş Testi, Kirpik Baskısız 3D, Vardiyalı Uyku) test edin.
• Değişkenleri izole edin; bütçenin tek bir görsele kaçmasını önleyin.

2️⃣ **Ölçekleme Fazı (Advantage+ & ASC):**
• Testte kazanan (CTR > %2.0, CPC < $1.50) kreatifleri **Advantage+ Campaign Budget** (eski CBO) ve **Advantage+ Sales (ASC)** kampanyalarına taşıyın.
• Günlük $50 başlangıç bütçesi belirleyin; ilk 72 saat stabil kaldığında bütçeyi %20 kademeli artırın.

3️⃣ **Öğrenme Fazı & EMQ Kuralı:**
• 50 dönüşüm eşiğini katı bir kural görmeyin; Ads Manager panelindeki öğrenme durumunu kontrol edin.
• Olay Eşleme Kalitesi (EMQ) ~6/10 seviyesindeyse soğuk faz için yeterlidir; teknik detaylarda boğulmayıp kreatif testine odaklanın.`
      : `📈 **2026 Meta Campaign Architecture & Budget Strategy**

Structured progression from cold launch to scale for Nightfold:

1️⃣ **Creative Testing (Manual / ABO):**
• Use Ad Set Budget Optimization (ABO) at $20-$25/day per ad set to isolate variables (Flashlight test vs Zero Lash Pressure).
2️⃣ **Scaling (Advantage+ & ASC):**
• Migrate winners (CTR > 2.0%, CPC < $1.50) into Advantage+ Campaign Budget & Advantage+ Sales Campaigns.
3️⃣ **Learning Phase & EMQ:**
• Treat learning phase thresholds pragmatically. EMQ ~6/10 is sufficient for launch; prioritize creative iteration over micro-tuning.`;
  }

  // 3. KREATİF, VİDEO, UGC & AI UYUMLULUĞU
  if (lower.includes('kreatif') || lower.includes('video') || lower.includes('içerik') || lower.includes('content') || lower.includes('ugc') || lower.includes('ai') || lower.includes('kanca') || lower.includes('hook') || lower.includes('tiktok') || lower.includes('reels')) {
    return language === 'tr'
      ? `🎬 **2026 Kreatif Stratejisi & AI İçerik Uyumluluk Rehberi**

🎯 **İlk 3 Saniye Kancaları (Thumbstop Formülleri):**
1. **Telefon Flaşı Testi (1 Numaralı Kanca):** Karanlık odada maskenin arkasına telefon flaşı tutulur — 0 lümen sızıntı görsel kanıtı.
2. **Kirpik Baskı Karşılaştırması:** Yandan makro çekim; göz kırparken kirpiklerin derin 3D çukura hiç değmediği yavaş çekim.
3. **Pazar Karşılaştırması:** "Manta Sleep'e $40 vermeden önce bunu görün — aynı 3D ergonomi $34.99."

⚠️ **Önemli 2026 Meta AI İçerik Uyarısı:**
• Reklamlarınızda AI ile üretilmiş fotogerçekçi modeller, yüzler veya sentetik sesler kullanıyorsanız; Meta Ads Manager panelinde **"Yapay Zeka İçeriği / AI Disclosure"** etiketini kesinlikle aktif hale getirin!
• Bu etiket açılmazsa Meta algoritması reklamınıza **sessiz dağıtım kısıtlaması (silent distribution throttling)** uygulayabilir ve erişimi dramatik şekilde düşürebilir.`
      : `🎬 **2026 Creative Strategy & AI Content Compliance**

🎯 **Top 3-Second Hooks (Thumbstop):**
1. **Flashlight Blackout Test (#1 Hook):** Smartphone flashlight pressed against mask in dark room — 0% lumen penetration proof.
2. **Zero Lash Pressure:** Macro side profile showing blink clearance.
3. **Price Arbitrage:** "$40 for Manta vs $34.99 for Nightfold."

⚠️ **Critical 2026 Meta AI Content Disclosure:**
• If your creatives use AI-generated photorealistic models or synthetic voices, enable the **"AI-Generated Content"** label in Ads Manager.
• Omitting this label risks silent distribution throttling by Meta's compliance algorithm.`;
  }

  // 4. BİRİM İKTİSADI, DE MINIMIS & FİYAT / KÂRLILIK
  if (lower.includes('ekonomi') || lower.includes('de minimis') || lower.includes('gümrük') || lower.includes('tarife') || lower.includes('katkı payı') || lower.includes('maliyet') || lower.includes('cogs') || lower.includes('margin') || lower.includes('kâr')) {
    return language === 'tr'
      ? `💰 **Birim İktisadı (Unit Economics) & 2026 De Minimis Hesaplaması**

DTC kârlılığının omurgası Net Katkı Payıdır (Net Contribution Margin):

📐 **Formül:**
\`Net Katkı Payı = AOV - (COGS + Kargo + İşlem Ücreti + Gümrük/Tarife)\`

🔍 **Nightfold İçin Hesaplama Örneği:**
• **Tekil Ürün ($34.99):** COGS (~$6.50) + Kargo (~$4.50) + Stripe/Shopify (%2.9 + $0.30 = ~$1.31) = Toplam Değişken Maliyet ~$12.31.
  ↳ Ham Katkı Payı: ~$22.68. Reklam CAC tavanı: $18.00 olmalıdır.
• **Duo Bundle ($59.00 — Önerilen):** 2 adet COGS (~$12.00) + Birleşik Kargo (~$5.50) + İşlem Ücreti (~$2.01) = Toplam ~$19.51.
  ↳ Net Katkı Payı: ~$39.49. CAC tavanı $30+'a çıkar, reklamlarda çok daha rahat ölçeklenirsiniz.

⚠️ **2026 De Minimis & Gümrük Uyarısı:**
Uluslararası veya Çin menşeili doğrudan gönderimlerde 2026 De Minimis muafiyet değişikliklerini göz önünde bulundurun. Gönderi başına olası $2-$4 gümrük/tarife ek maliyetini hesaplamalarınıza dahil ederek başabaş ROAS hedefinizi güncelleyin.`
      : `💰 **Unit Economics & 2026 De Minimis Intelligence**

📐 **Net Contribution Margin Formula:**
\`Net Contribution Margin = AOV - (COGS + Shipping + Processing Fee + Customs/Tariffs)\`

🔍 **Nightfold Unit Economics:**
• **Single Unit ($34.99):** Variable costs ~$12.31 ➔ Contribution margin ~$22.68 (Max target CAC ~$18.00).
• **Duo Bundle ($59.00):** Variable costs ~$19.51 ➔ Contribution margin ~$39.49 (Absorbs up to $30+ CAC comfortably).

⚠️ **2026 De Minimis Alert:**
Include potential $2-$4 customs/tariff charges in international fulfillment to protect break-even ROAS.`;
  }

  // 5. RAKİP ANALİZİ & MANTA SLEEP
  if (lower.includes('rakip') || lower.includes('competitor') || lower.includes('manta') || lower.includes('fiyat') || lower.includes('price')) {
    return language === 'tr'
      ? `🏆 **Rakip Analizi: Nightfold vs Manta Sleep PRO**

• **Manta Sleep PRO Fiyatı:** $39.99
• **Nightfold DeepRest Fiyatı:** $34.99 (Net **$5.00 Fiyat Arbitrajı**)
• **Duo Bundle Avantajı:** Nightfold 2'li paket $59.00 (Adet başı $29.50)

🎯 **Reklam Kanca Formülü:**
"Neden aynı 3D hafızalı sünger ergonomisine $40 veresiniz? Nightfold $34.99 — üstelik kirpiklerinize sıfır baskı ve %100 karartma garantisiyle."

📈 Bu kıyaslama açısı yüksek niyetli alıcılarda tıklama oranını (CTR) %35 artırır ve CPC maliyetini düşürür.`
      : `🏆 **Competitor Breakdown: Nightfold vs Manta Sleep PRO**

• **Manta Sleep PRO:** $39.99
• **Nightfold DeepRest:** $34.99 ($5.00 direct arbitrage advantage)
• **Duo Bundle:** 2 for $59.00 ($29.50/unit)

🎯 **Ad Hook Formula:**
"Why pay $40 for a 3D mask? Get identical zero-lash contour with Nightfold for $34.99 with guaranteed 100% blackout."`;
  }

  // 6. ÖLÇÜM, HESAP SAĞLIĞI & CFS
  if (lower.includes('sağlık') || lower.includes('health') || lower.includes('cfs') || lower.includes('emq') || lower.includes('pixel') || lower.includes('capi') || lower.includes('ölçüm')) {
    return language === 'tr'
      ? `🩺 **Hesap Sağlığı & Ölçümleme Rehberi (2026 Standartları)**

1️⃣ **Olay Eşleme Kalitesi (EMQ):**
• Meta CAPI/Pixel için ~6/10 eşiği soğuk lansman için yeterlidir.
• 6/10'dan 8/10'a çıkmak için harcanacak efor yerine bütçeyi kreatif testlerine ayırın.

2️⃣ **Müşteri Geri Bildirim Skoru (CFS) Güncellemesi:**
• Eski CFS skoru Meta arayüzünden kaldırılmıştır.
• Hesap sağlığınızı korumak için dahili panoda: İade oranı (< %3), ortalama teslimat süresi (3-5 iş günü) ve müşteri bilet çözüm süresini izleyin.

3️⃣ **Etik Dönüşüm İlkeleri:**
• Sahte kıtlık ve temelsiz sayaçlardan kaçının. Gerçek 36.714 adetlik stok gücünü şeffafça yansıtın.`
      : `🩺 **Account Health & Measurement (2026 Standards)**

1️⃣ **Event Match Quality (EMQ):**
• ~6/10 is sufficient for cold launch phase. Prioritize creative testing over technical micro-tuning.
2️⃣ **CFS Metric Retirement:**
• Track health via internal metrics: Return rate (<3%), delivery speed, and customer ticket resolution.
3️⃣ **Ethical Scarcity:**
• Avoid artificial stock countdowns. Leverage verified 36,714 warehouse units transparently.`;
  }

  // DEFAULT COMPREHENSIVE EXECUTIVE SUMMARY
  return language === 'tr'
    ? `🚀 **Nightfold E-Ticaret & Büyüme Direktörü Özeti**

📊 **Mağaza Durumu:**
• **Stok:** 36.714 adet ($1.28M envanter hacmi) depoda hazır.
• **Durum:** Soğuk lansman (0 satış) — Ana hedef ilk satışı ve ilk 100 siparişi yakalamak.
• **Fiyat:** Tekil $34.99 (Manta Sleep'e göre $5 daha avantajlı) | Duo Bundle $59.00.

🎯 **Öncelikli Eylem Planı:**
1. **Kreatif:** 3 saniyelik "Karanlık Odada Telefon Flaşı Testi (%100 Blackout kanıtı)" videosunu yayınlayın. (AI modeller varsa Meta AI etiketini açın!).
2. **Kampanya:** Yeni kreatifleri Manuel/ABO ile test edin; kazananları Advantage+ ve ASC kampanyalarına taşıyın.
3. **Birim İktisadı:** Net Katkı Payı = AOV - (COGS + Kargo + İşlem Ücreti + De Minimis/Tarife). $59 Duo Bundle ile kârlılığı güvenceye alın.
4. **Hesap Sağlığı:** EMQ ~6/10 yeterlidir. CFS kalktığı için iade oranı ve teslimat sürelerini iç panoda izleyin.

Bana sormak istediğiniz konuyu yazabilirsiniz: Kampanya mimarisi, kreatif senaryoları, De Minimis veya birim iktisadı!`
    : `🚀 **Nightfold Growth Director Executive Summary**

📊 **Store Status:**
• **Inventory:** 36,714 units ($1.28M volume) ready in warehouse.
• **Phase:** Cold launch (0 orders) — Core objective: First sale & first 100 orders.
• **Pricing:** $34.99 Single ($5 advantage vs Manta Sleep) | $59.00 Duo Bundle.

🎯 **Priority Action Plan:**
1. **Creative:** Launch 3-second Flashlight Blackout Test hooks (enable Meta AI label if using AI avatars).
2. **Campaign:** Manual/ABO for creative testing; scale winners into Advantage+ & ASC.
3. **Unit Economics:** Optimize Net Contribution Margin with $59 Duo Bundle and factor 2026 De Minimis tariffs.
4. **Health:** Maintain EMQ ~6/10; monitor internal return and dispatch metrics.`;
}

