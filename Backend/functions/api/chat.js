// functions/api/chat.js

export async function onRequest(context) {
  const { request, env } = context;

  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }

  if (request.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: corsHeaders(),
    });
  }

  try {
    const body = await request.json();
    const { messages = [], petProfile = null, mode = "general" } = body;

    const systemPrompt = buildSystemPrompt(petProfile, mode);

    // Prepend system prompt
    const finalMessages = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    const replyText = await callLLM(env, finalMessages);

    const responsePayload = {
      reply: replyText,
      disclaimer:
        "I’m an AI assistant and not a veterinarian. For specific medical concerns, please consult a licensed vet.",
    };

    return new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders(),
      },
    });
  } catch (err) {
    console.error("Chat handler error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to handle chat request." }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(),
        },
      }
    );
  }
}

// ---------- Helpers ----------

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*", // you can tighten this later
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

function buildSystemPrompt(petProfile, mode) {
  let base = `
You are Fleabie, the AI assistant inside the Whiskr pet health app.

Your job is to:
- Give clear, friendly explanations about general pet wellness, behavior, nutrition, and preventive care.
- Summarize vet records in simple language when asked, highlighting key diagnoses, tests, and follow-up instructions.
- Provide general care tips tailored to the pet’s species, breed, age, and known issues when that context is available.

Safety and boundaries (very important):
- You are NOT a veterinarian and you CANNOT diagnose conditions or prescribe specific treatments or medication dosages.
- Never contradict advice from a veterinarian.
- For anything that sounds urgent, severe, or rapidly worsening, clearly recommend that the user contact a veterinarian or emergency clinic right away.
- Do not invent lab values, test results, or medications that were not provided by the user.

Style:
- Be short, structured, and practical.
- Use bullet points and short sections where helpful.
- Explain medical terms in plain language.
- Always end with:
  1) A short disclaimer that you are not a vet.
  2) 1–3 questions the user could ask their vet.
`;

  let petContext = "";
  if (petProfile) {
    petContext = `
Pet profile:
- Name: ${petProfile.name || "Unknown"}
- Species: ${petProfile.species || "Unknown"}
- Breed: ${petProfile.breed || "Unknown"}
- Age (years): ${petProfile.ageYears ?? "Unknown"}
- Sex: ${petProfile.sex || "Unknown"}
- Medical notes: ${petProfile.medicalNotes || "None provided"}
`;
  }

  let modeContext = "";
  if (mode === "vet_summary") {
    modeContext = `
The user may paste text from a vet visit or lab report.

Your steps:
1) Summarize the findings in plain language.
2) List:
   - What the vet found
   - What tests/treatments were mentioned
   - What follow-up or monitoring is described
3) Suggest 2–3 good questions the user could ask their vet next time.
`;
  } else {
    modeContext = `
The user is asking a general pet question.

Your steps:
1) Use any pet profile information above to tailor advice.
2) Provide general guidance only (no diagnosis, no dosages).
3) Mention red-flag signs where they should see a vet in person.
`;
  }

  return base + "\n" + petContext + "\n" + modeContext;
}

async function callLLM(env, messages) {
  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("Missing GEMINI_API_KEY environment variable");
    throw new Error("Missing GEMINI_API_KEY");
  }

  // Convert our message format to Gemini's "contents" format
  const contents = messages.map((m) => {
    let role;
    if (m.role === "assistant") role = "model";
    else role = "user"; // treat system + user as "user" context

    return {
      role,
      parts: [{ text: m.content }],
    };
  });

  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
    encodeURIComponent(apiKey);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ contents }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("Gemini API error:", res.status, errText);
    throw new Error("Gemini API request failed");
  }

  const data = await res.json();

  const text =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    "Sorry, I couldn’t generate a response right now.";

  return text;
}
