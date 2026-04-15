import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GoogleGenAI } from '@google/genai';

export function SafetyTips() {
  const [tip, setTip] = useState<string>('Always stay aware of your surroundings when using public transport.');
  const [isLoading, setIsLoading] = useState(false);

  const generateTip = async () => {
    setIsLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
      const prompt = "Generate a short, practical safety tip for someone using public transportation or walking alone at night. Keep it under 20 words.";
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      
      setTip(response.text || 'Always stay aware of your surroundings.');
    } catch (error) {
      console.error('Error generating tip:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateTip();
  }, []);

  return (
    <Card className="glass-card border-none overflow-hidden rounded-3xl w-full">
      <CardHeader className="bg-brand-primary/5 border-b border-brand-border py-3">
        <CardTitle className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-primary">
          <Sparkles className="w-3.5 h-3.5" />
          Safety Insight
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 flex items-center justify-between gap-4">
        <p className="text-xs text-brand-text-dim italic leading-relaxed">
          "{tip}"
        </p>
        <Button 
          size="icon" 
          variant="ghost" 
          className="shrink-0 h-8 w-8 rounded-full hover:bg-white/5" 
          onClick={generateTip}
          disabled={isLoading}
        >
          <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />
        </Button>
      </CardContent>
    </Card>
  );
}

import { cn } from '@/lib/utils';
