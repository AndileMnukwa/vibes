
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are an AI customer support assistant for VibeCatcher, an event discovery and review platform. 

Key platform features you can help with:
- Event discovery and browsing
- Ticket purchasing and payment
- User reviews and ratings
- Event calendar integration
- User profiles and preferences
- Event categories and search
- Notifications and reminders

Common user queries you should handle:
- How to find events
- How to buy tickets
- How to leave reviews
- Account and profile management
- Calendar integration
- Refund and cancellation policies
- Technical support

Guidelines:
- Be helpful, friendly, and concise
- Provide step-by-step instructions when needed
- If you don't know something specific about VibeCatcher, be honest and suggest contacting human support
- Keep responses under 150 words unless detailed instructions are needed
- Use bullet points for multi-step processes
- Always stay in character as a VibeCatcher support assistant`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, chatHistory = [] } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Prepare messages array with system prompt and chat history
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...chatHistory.map((msg: any) => ({
        role: msg.isBot ? 'assistant' : 'user',
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const botResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ response: botResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-chat-support function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to process chat request' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
