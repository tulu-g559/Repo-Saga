'use client';

import { useState } from 'react';
import { chatWithTyrion } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Wine, Send, Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TyrionChat({ repoUrl }: { repoUrl: string }) {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { role: 'assistant', content: "I drink and I know things. Show me your code, and I shall tell you why it is... lacking." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const newHistory = [...messages, { role: 'user', content: input }];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    try {
      // Backend expects 'history' as previous turns
      const response = await chatWithTyrion(repoUrl, input, messages);
      // Assuming backend returns { response: "string" } or similar
      const reply = response.response || response.message || "I am too sober to answer this.";
      
      setMessages([...newHistory, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages([...newHistory, { role: 'assistant', content: "The ravens were lost. (API Error)" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="h-full flex flex-col bg-black/40 border-primary/20 backdrop-blur-md">
      <CardHeader className="bg-primary/5 border-b border-white/5 pb-3">
        <CardTitle className="font-headline text-amber-500 flex items-center gap-2">
          <Wine className="w-5 h-5" /> The Hand's Court
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-4">
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={cn("flex gap-3", m.role === 'user' ? "justify-end" : "justify-start")}>
                 {m.role === 'assistant' && <div className="w-8 h-8 rounded-full bg-amber-900/50 flex items-center justify-center border border-amber-500/30"><Bot className="w-4 h-4 text-amber-500"/></div>}
                 
                 <div className={cn(
                   "max-w-[80%] p-3 rounded-xl text-sm leading-relaxed",
                   m.role === 'user' 
                    ? "bg-primary/20 text-primary-foreground border border-primary/30 rounded-tr-none" 
                    : "bg-white/5 text-gray-300 border border-white/10 rounded-tl-none italic"
                 )}>
                   {m.content}
                 </div>

                 {m.role === 'user' && <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30"><User className="w-4 h-4 text-primary"/></div>}
              </div>
            ))}
            {loading && <div className="text-xs text-muted-foreground animate-pulse pl-12">Tyrion is pouring wine...</div>}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-3 border-t border-white/5">
        <div className="flex w-full gap-2">
          <Input 
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask for a roast or code advice..." 
            className="bg-black/50 border-white/10 focus:border-amber-500/50"
          />
          <Button onClick={handleSend} size="icon" className="bg-amber-600 hover:bg-amber-700">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}