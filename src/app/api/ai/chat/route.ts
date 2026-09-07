import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/gemini';

/**
 * /api/ai/chat — Dedicated conversational AI endpoint for ShopPulse AI Assistant.
 * Sends user prompt with full Nightfold store context to Gemini for dynamic responses.
 */

const SYSTEM_PROMPT = `
You are ShopPulse AI — a senior E-Commerce Director & Growth Strategist for the DTC brand Nightfold (nightfold.com).

STORE CONTEXT (Real-Time Shopify Data):
- Hero Product: Nightfold DeepRest 3D Contoured Sleep Mask
- Retail Price: $34.99
- Current Inventory: 36,714 units in warehouse
- Total Orders: 0 (cold launch stage)
- Key USPs: 100% Total Blackout, Deep 3D Eye Contours (Zero Lash Pressure), Memory Foam, Cooling Breathable Silk-blend
- Direct Competitor: Manta Sleep PRO ($39.99) — Nightfold has a $5.00 price arbitrage advantage
- Ad Channels: Meta Ads (Advantage+), TikTok Ads, Instagram Reels
- Business Stage: Pre-launch, ready to scale via paid social and UGC content

RULES:
1. Ground every recommendation in mathematical DTC data (AOV, margins, stock velocity, ad ROAS, bundle strategies, conversion psychology).
2. Never give vague or generic advice — be specific with numbers, percentages, and actionable steps.
3. Reference the actual store data above in your responses.
4. Be direct, professional, and maintain an encouraging yet rigorous B2B SaaS tone.
5. Keep responses concise (2-4 paragraphs max) but information-dense.
6. When discussing pricing, always factor in the $5 arbitrage vs Manta Sleep PRO.
7. Suggest specific creative angles, bundle configurations, or campaign structures when relevant.
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
          historyContext = '\nCONVERSATION HISTORY:\n' + recentHistory.map((msg: any) =>
            `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.text}`
          ).join('\n') + '\n';
        }

        const response = await gemini.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `${SYSTEM_PROMPT}
${historyContext}
Language: Respond in ${language === 'tr' ? 'Turkish' : 'English'}.
User Question: "${prompt}"
`,
          config: {
            temperature: 0.45,
            maxOutputTokens: 800,
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
                content: `${SYSTEM_PROMPT}\nRespond in ${language === 'tr' ? 'Turkish' : 'English'}.`,
              },
              { role: 'user', content: prompt },
            ],
            max_tokens: 600,
          }),
        });

        if (openAiRes.ok) {
          const data = await openAiRes.json();
          const replyText = data.choices?.[0]?.message?.content;
          if (replyText) {
            return NextResponse.json({
              success: true,
              reply: replyText,
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
            max_tokens: 600,
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

    // 4. Final fallback: Intelligent heuristic engine
    return NextResponse.json({
      success: true,
      reply: generateHeuristicReply(prompt, language),
      provider: 'nightfold-heuristics',
      model: 'dtc-growth-engine-v3',
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
 * Keyword-aware heuristic fallback when no LLM API key is configured.
 */
function generateHeuristicReply(prompt: string, language: string): string {
  const lower = prompt.toLowerCase();

  if (lower.includes('dönüşüm') || lower.includes('conversion') || lower.includes('satış') || lower.includes('order') || lower.includes('sipariş')) {
    return language === 'tr'
      ? '📊 Nightfold DeepRest 3D Uyku Maskesi şu an canlı katalogda 36.714 adet stokla hazır bekliyor ancak henüz 0 sipariş kaydedilmiş.\n\n🎯 Temel tıkanıklık: Soğuk trafik hunisinde kanca (hook) eksikliği. TikTok ve Instagram Reels için "100% Karartma (Zero Light Leak)" temalı 3 saniyelik kreatif kancalar üretmenizi öneriyorum.\n\n💡 Hemen uygulanabilir aksiyonlar:\n• Sepette "2. Ürüne %40 İndirim" uyku seti teklifi sunun\n• Ürün sayfasına telefon flaşı testi UGC videosu ekleyin\n• İlk 100 siparişe özel %15 kupon pop-up tanımlayın\n\nBu üç hamle birlikte dönüşüm oranınızı tahminen %25-30 artıracaktır.'
      : '📊 Nightfold DeepRest 3D Sleep Mask has 36,714 units in stock but records 0 orders so far.\n\n🎯 Primary bottleneck: Missing stop-scroll hooks in the cold traffic funnel. I recommend creating 3-second TikTok/Reels hooks themed around "100% Blackout – Zero Light Leak."\n\n💡 Immediate actions:\n• Launch a "Buy 1, Get 2nd at 40% Off" couples sleep set\n• Add a flashlight test UGC video to the product page\n• Deploy a 15% exit-intent coupon for the first 100 orders\n\nThese three moves combined should lift your conversion rate by 25-30%.';
  }

  if (lower.includes('rakip') || lower.includes('competitor') || lower.includes('manta') || lower.includes('fiyat') || lower.includes('price')) {
    return language === 'tr'
      ? '🏆 Rakip Analizi: Manta Sleep PRO şu anda $39.99 seviyesinde fiyatlandırılmış.\n\nNightfold ($34.99) olarak tam $5.00 net fiyat avantajına ve 3D derin göz oyukları (sıfır göz baskısı) ergonomisine sahipsiniz. Bu çift avantajı reklam kopyalarınızda kullanmalısınız.\n\n🎯 Önerilen A/B test reklam kancası: "Neden $40 veresiniz? Aynı 3D ergonomi $34.99 — üstelik kirpiklerinize sıfır baskı."\n\n📈 Bu mesajlaşma stratejisi CTR\'yi %35 artıracak ve CPC\'yi düşürecektir.'
      : '🏆 Competitor Analysis: Manta Sleep PRO retails at $39.99.\n\nNightfold ($34.99) has a $5.00 immediate price arbitrage advantage plus zero-pressure 3D contoured eye cups. You should leverage this dual advantage in your ad copy.\n\n🎯 Recommended A/B test hook: "Why pay $40+ for a sleep mask? Same 3D contour, $34.99 — with zero lash pressure."\n\n📈 This messaging strategy should drive a 35% lift in CTR and lower CPC.';
  }

  if (lower.includes('stok') || lower.includes('inventory') || lower.includes('reklam') || lower.includes('bütçe') || lower.includes('budget') || lower.includes('ads')) {
    return language === 'tr'
      ? '📦 Stok & Reklam Bütçesi Analizi:\n\nDepoda 36.714 adet Nightfold DeepRest stoku mevcut — bu $1.28M potansiyel envanter değerine karşılık gelir. Bu yüksek hacim, Meta Advantage+ kampanyalarında günlük bütçeyi güvenle ölçeklendirmenize olanak tanır.\n\n💰 Bütçe önerisi: Günlük $50 ile başlayıp, CTR %2+ ve CPC $1.50 altında kalırsa 72 saat içinde $100/gün\'e çıkın.\n\n🎯 Stok maliyetini hızla nakite döndürmek için "İkili Alımda 2. Ürün $24 (Duo Bundle: $59)" teklifini ana sayfada öne çıkarın.'
      : '📦 Inventory & Ad Budget Analysis:\n\nYou hold 36,714 units ($1.28M inventory value). This volume allows safe scaling of Meta Advantage+ ad spend without stockout risk.\n\n💰 Budget recommendation: Start at $50/day, and if CTR hits 2%+ with CPC below $1.50, scale to $100/day within 72 hours.\n\n🎯 To accelerate cash conversion, feature a "Duo Bundle at $59.00 (2nd mask at $24)" on your storefront hero section.';
  }

  if (lower.includes('tiktok') || lower.includes('reels') || lower.includes('video') || lower.includes('içerik') || lower.includes('content') || lower.includes('ugc')) {
    return language === 'tr'
      ? '🎬 TikTok & Reels İçerik Stratejisi:\n\n3 saniyelik stop-scroll kanca formülleri:\n\n1️⃣ "Telefon Flaşı Testi" — Maskenin arkasına flaş tutulup 0 ışık sızıntısı kanıtlanır\n2️⃣ "Kirpik Baskı Karşılaştırması" — 3D çukurun kirpiklere hiç değmediği yavaş çekim\n3️⃣ "Rakiple Yan Yana" — Nightfold vs düz maske kalınlık karşılaştırması\n\n📊 En iyi performans gösteren UGC trendleri: Karanlık oda aydınlatma, ASMR kutu açılış, "Bunu Biliyor Muydunuz?" formatları.\n\n🎯 İçerik Stüdyosu\'nu açarak AI destekli reklam metinleri ve senaryo şablonları üretebilirsiniz.'
      : '🎬 TikTok & Reels Content Strategy:\n\n3-second stop-scroll hook formulas:\n\n1️⃣ "Flashlight Test" — Flashlight held behind mask proving 0% light leakage\n2️⃣ "Lash Pressure Comparison" — Slow-mo showing 3D contour hovering over lashes\n3️⃣ "Side-by-Side" — Nightfold vs flat mask thickness comparison\n\n📊 Top-performing UGC trends: Dark room lighting, ASMR unboxing, "Did You Know?" formats.\n\n🎯 Open the Creative Studio to generate AI-powered ad copy and script templates.';
  }

  // Default comprehensive response
  return language === 'tr'
    ? '🚀 Nightfold Büyüme Direktörü Özeti:\n\n📊 Mevcut Durum: 36.714 adet stok ($1.28M potansiyel envanter değeri) aktif, 0 sipariş — soğuk lansman aşamasındasınız.\n\n🎯 1 Numaralı Öncelik: TikTok 3 saniyelik "Karanlık Odada Flaş Testi" kancasını devreye alarak ilk 100 siparişi yakalamak.\n\n💰 Paket Stratejisi: İkili paket (Duo Bundle) $59.00 fiyatla sepet ortalamanızı güvenceye alın (AOV artışı +%68).\n\n📈 Meta Ads: $50/gün bütçeyle Advantage+ Shopping kampanyası başlatın, 72 saat sonra CPC ve CTR metriklerine göre ölçekleyin.\n\nBana herhangi bir konuda detay sorabilirsiniz — dönüşüm, rakip analizi, reklam bütçesi, içerik stratejisi veya fiyatlama.'
    : '🚀 Nightfold Growth Director Summary:\n\n📊 Current State: 36,714 units ($1.28M inventory pipeline) ready, 0 orders — you are in cold launch stage.\n\n🎯 Priority #1: Launch 3-second TikTok "Flashlight Blackout Test" hooks to capture the first 100 orders.\n\n💰 Bundle Strategy: Duo Bundle at $59.00 to secure robust AOV (+68% lift).\n\n📈 Meta Ads: Start with $50/day Advantage+ Shopping campaign, scale based on CPC/CTR metrics after 72 hours.\n\nAsk me about any topic — conversions, competitor analysis, ad budget, content strategy, or pricing.';
}
