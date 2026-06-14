const PROMPT = `You are reading a Singapore bank rewards/points app screenshot.
Extract the REDEEMABLE balance (not pending, not expiring, not lifetime earned).
Return ONLY valid JSON, no markdown:
{"bank":"one of [KrisFlyer,DBS,UOB,OCBC 90N,OCBC Rewards,Citi ThankYou,Citi Miles,HSBC,SC Tier1,SC Tier2,Amex,Maybank,Unknown]","balance":0,"label":"short field name","confidence":"high|medium|low","note":""}
Rules: KrisFlyer=KRISFLYER MILES total not Elite; UOB=UNI$ available; HSBC=Your points at top; OCBC 90N=Travel$ or 90N Miles; DBS=DBS Points; Citi=distinguish by card type; SC=360° Rewards Points; Amex=Membership Rewards; Maybank=Treats Points available; blurry=confidence low balance 0`;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { base64, mimeType } = req.body ?? {};
  if (!base64 || !mimeType) return res.status(400).json({ error: "base64 and mimeType required" });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });

  const upstream = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "anthropic-version": "2023-06-01",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 300,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mimeType, data: base64 } },
          { type: "text", text: PROMPT },
        ],
      }],
    }),
  });

  if (!upstream.ok) {
    const err = await upstream.text().catch(() => upstream.statusText);
    return res.status(upstream.status).json({ error: err });
  }

  const data = await upstream.json();
  const text = data.content?.find((b) => b.type === "text")?.text ?? "";
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) return res.status(500).json({ error: "No JSON in response" });

  try {
    res.json(JSON.parse(text.slice(start, end + 1)));
  } catch {
    res.status(500).json({ error: "Failed to parse Claude response" });
  }
}
