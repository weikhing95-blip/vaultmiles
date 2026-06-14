export interface OcrResult {
  bank: string;
  balance: number;
  label: string;
  confidence: "high" | "medium" | "low";
  note: string;
}

const SYSTEM_PROMPT = `You are reading a Singapore bank rewards/points app screenshot.
Extract the REDEEMABLE balance (not pending, not expiring, not lifetime earned).
Return ONLY valid JSON, no markdown:
{"bank":"one of [KrisFlyer,DBS,UOB,OCBC 90N,OCBC Rewards,Citi ThankYou,Citi Miles,HSBC,SC Tier1,SC Tier2,Amex,Unknown]","balance":0,"label":"short field name","confidence":"high|medium|low","note":""}
Rules: KrisFlyer=KRISFLYER MILES total not Elite; UOB=UNI$ available; HSBC=Your points at top; OCBC 90N=Travel$ or 90N Miles; DBS=DBS Points; Citi=distinguish by card type; SC=360° Rewards Points; Amex=Membership Rewards; blurry=confidence low balance 0`;

export async function readScreenshot(
  base64: string,
  mimeType: string,
): Promise<OcrResult> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "anthropic-version": "2023-06-01",
      "x-api-key": process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? "",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 256,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mimeType,
                data: base64,
              },
            },
            {
              type: "text",
              text: SYSTEM_PROMPT,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    throw new Error(`OCR request failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();

  // Extract text content from first text block
  const textBlock = (data.content as Array<{ type: string; text?: string }>).find(
    (b) => b.type === "text",
  );

  if (!textBlock || !textBlock.text) {
    throw new Error("No text block in Claude response");
  }

  const raw = textBlock.text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object found in Claude response");

  const parsed = JSON.parse(raw.slice(start, end + 1)) as OcrResult;
  return parsed;
}
