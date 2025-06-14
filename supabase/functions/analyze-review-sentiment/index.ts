
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reviewId, title, content } = await req.json();

    if (!reviewId || !title || !content) {
      throw new Error('Missing required fields: reviewId, title, content');
    }

    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicApiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    // Analyze sentiment using Claude AI
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: `Analyze the sentiment of this event review and provide a brief summary. 

Title: ${title}
Content: ${content}

Please respond with a JSON object containing:
1. "sentiment": one of "positive", "negative", or "neutral"
2. "confidence": a decimal between 0 and 1 indicating confidence level
3. "summary": a brief 2-3 sentence summary of the key points

Only respond with valid JSON, no other text.`
          }
        ]
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.content[0].text;
    
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (e) {
      // Fallback if JSON parsing fails
      console.error('Failed to parse Claude response as JSON:', analysisText);
      analysis = {
        sentiment: 'neutral',
        confidence: 0.5,
        summary: 'Unable to generate summary.'
      };
    }

    // Update the review in the database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error: updateError } = await supabase
      .from('reviews')
      .update({
        sentiment: analysis.sentiment,
        sentiment_confidence: analysis.confidence,
        ai_summary: analysis.summary,
      })
      .eq('id', reviewId);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        sentiment: analysis.sentiment,
        confidence: analysis.confidence,
        summary: analysis.summary,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-review-sentiment function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
