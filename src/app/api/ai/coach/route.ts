import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/gemini';

interface AICoachRequestBody {
  prompt: string;
  storeContext?: any;
  language?: 'tr' | 'en';
}

/**
 * System prompt for ShopPulse AI Coach based on PRD Bölüm 11.1
 */
const SYSTEM_PROMPT = `
Sen ShopPulse AI — DTC markası Nightfold (nightfold.store) için Baş Büyüme Koçu ve E-Ticaret Direktörüsün (Head of Growth & E-Commerce Director).

MAĞAZA VE ÜRÜN BAĞLAMI:
- Mağaza: Nightfold (nightfold.store)
- Hero Ürün: Nightfold DeepRest 3D Konturlu Uyku Maskesi ($34.99 birim fiyat, $59.00 Duo Bundle teklifi)
- Envanter Durumu: Depoda 36.714 Adet hazır stok ($1.28M Envanter Hacmi)
- Mevcut Aşama: Soğuk lansman (0 sipariş) fazı. Ana hedef: İlk satışı ve ilk 100 siparişi yakalamak.
- Doğrudan Rakip: Manta Sleep PRO ($39.99) — Nightfold $5.00 net fiyat arbitrajına ve üstün 3D göz çukuru ergonomisine sahiptir.

2026 META & DTC İLKELERİ:
1. Kampanya Mimarisi: Yeni testler için Manuel/ABO; kazananları ölçeklemek için Advantage+ Campaign Budget ve Advantage+ Sales (ASC).
2. Kreatif & AI Uyumluluğu: İlk 3 saniye kancası kritik. 1 numaralı kanca: "Karanlık Odada Telefon Flaşı Testi (%100 Blackout kanıtı)". AI içeriklerde Meta AI etiketini hatırlat (sessiz dağıtım kısıtlamasını önlemek için).
3. Birim İktisadı: Net Katkı Payı = AOV - (COGS + Kargo + İşlem Ücreti + Gümrük/Tarife). 2026 De Minimis gümrük maliyetlerini dahil et. $59 Duo Bundle ile AOV'yi koru.
4. Ölçüm ve Sağlık: EMQ ~6/10 yeterlidir. CFS kalktığı için iade oranı ve kargo sürelerini iç panoda takip et. Sahte sayaçlardan kaçın.
`;

export async function POST(request: NextRequest) {
  try {
    const body: AICoachRequestBody = await request.json();
    const { prompt, storeContext, language = 'tr' } = body;

    const lowerPrompt = (prompt || '').toLowerCase();
    const openAiKey = process.env.OPENAI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    // 1. Attempt Gemini 2.5 / 1.5 Flash First
    const gemini = getGeminiClient();
    if (gemini) {
      try {
        const response = await gemini.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `
${SYSTEM_PROMPT}
Language: Respond in ${language === 'tr' ? 'Turkish' : 'English'}.
User Question / Strategy Request: "${prompt}"
`,
          config: {
            temperature: 0.4,
            maxOutputTokens: 600,
          },
        });

        const replyText = response.text;
        if (replyText) {
          return NextResponse.json({
            success: true,
            reply: replyText,
            provider: 'google-genai',
            model: 'gemini-2.5-flash',
            tokensUsed: 220,
          });
        }
      } catch (err) {
        console.warn('[AI Coach] Gemini call failed, trying secondary LLM providers:', err);
      }
    }

    // 2. Secondary: Anthropic Claude
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
            max_tokens: 450,
            system: `${SYSTEM_PROMPT}\nRespond in ${language === 'tr' ? 'Turkish' : 'English'}.`,
            messages: [{ role: 'user', content: prompt }],
          }),
        });

        if (anthropicRes.ok) {
          const data = await anthropicRes.json();
          const replyText = data.content?.[0]?.text;
          if (replyText) {
            return NextResponse.json({
              success: true,
              reply: replyText,
              provider: 'anthropic-claude-3.5-sonnet',
              model: 'claude-3-5-sonnet-20241022',
              tokensUsed: data.usage?.output_tokens || 180,
            });
          }
        }
      } catch (err) {
        console.warn('[AI Coach] Anthropic call failed, trying OpenAI:', err);
      }
    }

    // 3. Tertiary: OpenAI GPT-4o
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
                content: `${SYSTEM_PROMPT}\nRespond in ${language === 'tr' ? 'Turkish' : 'English'}.`,
              },
              { role: 'user', content: prompt },
            ],
            max_tokens: 450,
          }),
        });

        if (openAiRes.ok) {
          const data = await openAiRes.json();
          const replyText = data.choices?.[0]?.message?.content;
          if (replyText) {
            return NextResponse.json({
              success: true,
              reply: replyText,
              provider: 'openai-gpt-4o',
              model: 'gpt-4o',
              tokensUsed: data.usage?.total_tokens || 210,
            });
          }
        }
      } catch (err) {
        console.warn('[AI Coach] OpenAI call failed, falling back to Nightfold DTC heuristic engine:', err);
      }
    }

    // 4. Multi-Tier Graceful Degradation (Nightfold DTC Growth Engine)
    let reply = '';

    if (lowerPrompt.includes('dönüşüm') || lowerPrompt.includes('conversion') || lowerPrompt.includes('sipariş')) {
      reply =
        language === 'tr'
          ? 'Nightfold dönüşüm hunisi için öncelikli reçete: 3 saniyelik "Karanlık Odada Telefon Flaşı Testi (%100 Blackout kanıtı)" videosunu ürün sayfası vitrinine ekleyin. $34.99 tekil ürün yerine $59.00 Duo Bundle (2 Adet Maske) teklifini öne çıkararak AOV yükseltin ve sepette ilk siparişe özel %15 hoş geldin pop-up\'ı tanımlayın.'
          : 'Priority conversion playbook for Nightfold: Add the 3-second "Flashlight Blackout Test" video proof to hero section. Lead with the $59.00 Duo Bundle to elevate AOV, and deploy a 15% exit-intent incentive for the first 100 orders.';
    } else if (
      lowerPrompt.includes('rakip') ||
      lowerPrompt.includes('competitor') ||
      lowerPrompt.includes('manta') ||
      lowerPrompt.includes('fiyat') ||
      lowerPrompt.includes('arbitraj')
    ) {
      reply =
        language === 'tr'
          ? 'Manta Sleep PRO $39.99 seviyesinde fiyatlandırılmışken Nightfold DeepRest ($34.99) ile net $5.00 fiyat avantajına sahibiz. Reklam setlerinizde "Neden $40 veresiniz? Aynı 3D ergonomi ve sıfır kirpik baskısı $34.99" kıyaslama kancasını test edin; bu açı CTR\'yi %35 artıracaktır.'
          : 'Market incumbent Manta Sleep PRO retails at $39.99. Nightfold ($34.99) gives you an immediate $5.00 price advantage. Comparison hooks like "Why pay $40 for a 3D sleep mask? Same contour at $34.99" will drive a 35% lift in CTR.';
    } else if (lowerPrompt.includes('stok') || lowerPrompt.includes('inventory') || lowerPrompt.includes('reklam') || lowerPrompt.includes('bütçe') || lowerPrompt.includes('meta')) {
      reply =
        language === 'tr'
          ? 'Depoda 36.714 adet ($1.28M hacim) hazır stok bulunuyor. 2026 Meta reklam mimarisine göre: Yeni kanca testlerini Reklam Seti Bütçesi (ABO - günlük $20-$25) ile yapın, kazananları Advantage+ Campaign Budget ve Advantage+ Sales (ASC) kampanyalarına taşıyın. AI kreatifler kullanılıyorsa Meta AI etiketini açmayı unutmayın.'
          : 'You hold 36,714 units ($1.28M volume) in warehouse stock. In 2026 Meta architecture: Test creatives via Ad Set Budget (ABO at $20-$25/day), then scale winners into Advantage+ and ASC. Remember to enable Meta AI disclosure if using synthetic avatars.';
    } else {
      reply =
        language === 'tr'
          ? 'Nightfold büyüme direktörü aksiyon planı: Soğuk lansmandaki 36.714 adet stoğu harekete geçirmek için 3 saniyelik Telefon Flaşı Kancası ile ilk 100 siparişi yakalayın. $59 Duo Bundle ile birim katkı payınızı koruyun, uluslararası gönderimlerde 2026 De Minimis gümrük maliyetlerini hesaba katın.'
          : 'Nightfold growth priority: Mobilize 36,714 warehoused units by launching 3-second Flashlight Blackout hooks to secure the first 100 orders. Protect contribution margin with $59 Duo Bundle and account for 2026 De Minimis customs.';
    }

    return NextResponse.json({
      success: true,
      reply,
      provider: 'nightfold-dtc-heuristics-2026',
      model: 'meta-growth-cfo-2026',
      tokensUsed: 220,
      fallbackMode: true,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'AI processing failure' },
      { status: 500 }
    );
  }
}
