
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

    // Get the OpenAI API key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    console.log('OPENAI_API_KEY found:', !!openaiApiKey);
    
    if (!openaiApiKey) {
      console.error('OPENAI_API_KEY environment variable is not set or is empty');
      throw new Error('OPENAI_API_KEY not configured - please check Supabase Edge Function secrets');
    }

    console.log('Starting sentiment analysis for review:', reviewId);

    // Analyze sentiment using OpenAI GPT
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that analyzes sentiment of event reviews. Always respond with valid JSON only, no other text.'
          },
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
        ],
        temperature: 0.3,
        max_tokens: 500
      }),
    });

    console.log('OpenAI API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error details:', errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Raw OpenAI response:', JSON.stringify(data));
    
    const analysisText = data.choices[0].message.content;
    console.log('Analysis text:', analysisText);
    
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (e) {
      // Fallback if JSON parsing fails
      console.error('Failed to parse OpenAI response as JSON:', analysisText);
      analysis = {
        sentiment: 'neutral',
        confidence: 0.5,
        summary: 'Unable to generate summary due to parsing error.'
      };
    }

    console.log('Parsed analysis:', analysis);

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
      console.error('Database update error:', updateError);
      throw updateError;
    }

    console.log('Successfully updated review with sentiment analysis');

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
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
