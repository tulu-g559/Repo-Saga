'use client';

import type { CodebaseMap, MapNode as MapNodeType } from '@/lib/types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Library, Users, Flame, File, Castle, Sword, Scroll } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CodebaseMapProps {
  data: CodebaseMap;
  onNodeSelect?: (nodeId: string) => void; // New Prop for interaction
}

// Updated Icons for a more RPG feel
const personaIcons: { [key: string]: React.ElementType } = {
  "Gatekeeper": Shield,
  "The Gatekeeper": Shield,
  "Library": Library,
  "The Library": Library,
  "Town Square": Castle,
  "The Town Square": Castle,
  "Dragon": Flame,
  "The Dragon's Lair": Flame,
  "Wizard": Scroll,
  "Warrior": Sword,
};

const Node = ({ node, isDragon, onNodeSelect }: { node: MapNodeType; isDragon: boolean; onNodeSelect?: (id: string) => void }) => {
  // Fallback to File icon, but try to match others
  let Icon = File;
  for (const key in personaIcons) {
    if (node.label.includes(key)) {
      Icon = personaIcons[key];
      break;
    }
  }
  if (isDragon) Icon = Flame;

  return (
    <Tooltip>
      <TooltipTrigger
        // Added onClick and cursor-pointer
        onClick={() => onNodeSelect?.(node.id)} 
        className="absolute transition-all duration-300 hover:scale-125 focus:outline-none focus:z-50 cursor-pointer group"
        style={{
          left: `calc(${node.x}% - ${node.size * 8}px)`,
          top: `calc(${node.y}% - ${node.size * 8}px)`,
          width: `${node.size * 16}px`,
          height: `${node.size * 16}px`,
        }}
      >
        <div
          className={cn(
            'w-full h-full rounded-full flex items-center justify-center shadow-lg border-2 transition-all',
            // Dragon/Boss Nodes: Red pulsating glow
            isDragon 
              ? 'bg-destructive/20 border-destructive shadow-[0_0_15px_rgba(239,68,68,0.6)] animate-pulse' 
              : 'bg-background/80 border-primary/50 hover:border-accent hover:shadow-[0_0_15px_rgba(234,179,8,0.5)]'
          )}
        >
          <Icon className={cn(
            'h-1/2 w-1/2 transition-colors', 
            isDragon ? 'text-destructive' : 'text-primary group-hover:text-accent'
          )} />
        </div>
        
        {/* RPG Level Badge */}
        <div className="absolute -bottom-2 -right-2 bg-background border border-primary text-[10px] w-5 h-5 flex items-center justify-center rounded-full text-primary font-bold shadow-sm">
            {node.files.length}
        </div>
      </TooltipTrigger>
      
      {/* RPG Tooltip Style */}
      <TooltipContent side="top" className="max-w-xs bg-popover/95 border-primary/50 text-popover-foreground backdrop-blur-md">
        <p className="font-bold font-headline text-accent text-lg">{node.label}</p>
        <p className="text-sm text-muted-foreground italic mb-2">"{node.tooltip}"</p>
        <div className="bg-secondary/50 p-2 rounded text-xs font-code border border-border/50">
            <span className="text-primary font-bold">Loot (Files):</span> {node.files.slice(0, 3).join(', ')}
            {node.files.length > 3 && ` +${node.files.length - 3} more`}
        </div>
        <p className="text-[10px] text-primary/60 mt-2 text-center border-t border-primary/20 pt-1">Click to Consult Master</p>
      </TooltipContent>
    </Tooltip>
  );
};

export function CodebaseMap({ data, onNodeSelect }: CodebaseMapProps) {
  const dragonNodeId = data.highlights?.complex_dragon?.node_id;

  const getNodeCenter = (nodeId: string) => {
    const node = data.nodes.find(n => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    return {
      x: node.x,
      y: node.y,
    };
  };

  return (
    <TooltipProvider>
      {/* Map Background: Dark grid with a subtle radial gradient */}
      <div className="w-full h-full bg-[#0a0a0f] rounded-lg border-2 border-primary/30 relative overflow-hidden shadow-inner group min-h-[400px]">
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-10" 
             style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
        </div>

        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
          aria-hidden="true"
        >
          {data.edges.map((edge, i) => {
            const fromCenter = getNodeCenter(edge.from);
            const toCenter = getNodeCenter(edge.to);
            return (
              <g key={i}>
                  {/* Glowing line effect */}
                  <line
                    x1={`${fromCenter.x}%`}
                    y1={`${fromCenter.y}%`}
                    x2={`${toCenter.x}%`}
                    y2={`${toCenter.y}%`}
                    className="stroke-primary/20"
                    strokeWidth={edge.weight * 6}
                    strokeLinecap="round"
                  />
                  <line
                    x1={`${fromCenter.x}%`}
                    y1={`${fromCenter.y}%`}
                    x2={`${toCenter.x}%`}
                    y2={`${toCenter.y}%`}
                    className="stroke-accent/40"
                    strokeDasharray="4 8"
                    strokeWidth={1}
                  />
              </g>
            );
          })}
        </svg>

        <div className="relative z-10 w-full h-full">
            {data.nodes.map(node => (
            <Node 
                key={node.id} 
                node={node} 
                isDragon={node.id === dragonNodeId} 
                onNodeSelect={onNodeSelect} // Pass interaction down
            />
            ))}
        </div>

        {/* Boss Encounter Notification */}
        {data.highlights?.complex_dragon && (
            <div className="absolute bottom-4 right-4 z-20 animate-in slide-in-from-bottom-5 duration-700 pointer-events-none">
                <Card className="bg-destructive/10 border-destructive/50 backdrop-blur-md max-w-[250px]">
                    <CardHeader className="p-3 pb-1">
                        <CardTitle className="text-sm flex items-center gap-2 text-destructive font-headline">
                            <Flame className="w-4 h-4 animate-pulse" /> BOSS DETECTED
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-1 text-xs text-destructive-foreground/80">
                        <p className="font-bold">{data.highlights.complex_dragon.file}</p>
                        <p>Danger Level: {data.highlights.complex_dragon.complexity_score}</p>
                    </CardContent>
                </Card>
            </div>
        )}
      </div>
    </TooltipProvider>
  );
}