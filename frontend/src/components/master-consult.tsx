'use client';

import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Scroll, X } from "lucide-react";
import { Button } from "./ui/button";
import ReactMarkdown from 'react-markdown';

interface MasterConsultProps {
  node: any; // The selected node data
  lore: any; // The data returned from /consult_master
  loading: boolean;
  onClose: () => void;
}

export function MasterConsultPanel({ node, lore, loading, onClose }: MasterConsultProps) {
  if (!node) return null;

  return (
    <div className="h-full border-l border-primary/20 bg-black/60 backdrop-blur-xl flex flex-col animate-in slide-in-from-right duration-500">
      
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex justify-between items-start">
        <div>
          <h2 className="font-headline text-xl text-primary glow-blue">{node.label}</h2>
          <Badge variant="outline" className="mt-2 font-code text-[10px] text-muted-foreground border-white/10">
            {node.files?.[0] || "Unknown Location"}
          </Badge>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-red-500/20 hover:text-red-400">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-grow p-4">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-primary/10 rounded w-3/4"></div>
            <div className="h-4 bg-primary/10 rounded w-1/2"></div>
            <div className="h-32 bg-primary/5 rounded border border-primary/10"></div>
            <p className="text-xs text-primary/60 text-center mt-4">Consulting the Grand Maester...</p>
          </div>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none">
             {/* We expect 'lore' to have a 'description' or 'story' field based on backend */}
             <div className="bg-secondary/30 p-4 rounded-lg border border-primary/10 mb-4">
                <h3 className="text-accent flex items-center gap-2 mt-0 text-sm uppercase tracking-widest">
                  <Scroll className="w-4 h-4" /> The Lore
                </h3>
                
                {/* Fixed: Wrapped ReactMarkdown in a div for styling instead of passing className directly */}
                <div className="text-gray-300">
                    <ReactMarkdown>
                      {typeof lore === 'string' ? lore : (lore?.description || lore?.summary || "No records found in the Citadel.")}
                    </ReactMarkdown>
                </div>

             </div>

             {/* Tech Details Section */}
             {lore?.tech_details && (
                <div className="mt-4">
                   <h4 className="font-bold text-white mb-2">Arcane Mechanics</h4>
                   <p className="text-gray-400">{lore.tech_details}</p>
                </div>
             )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}