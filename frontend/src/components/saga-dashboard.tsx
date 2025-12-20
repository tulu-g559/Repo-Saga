'use client';

import { useState } from 'react';
import { CodebaseMap } from '@/components/codebase-map';
import { ComicViewer } from '@/components/comic-viewer';
import { TaskList } from '@/components/task-list';
import { TyrionChat } from '@/components/tyrion-chat'; // New Import
import { MasterConsultPanel } from '@/components/master-consult'; // New Import
import { OnboardingReadme } from '@/components/onboarding-readme';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, ListChecks, FileText, Wine, Eye, EyeOff } from 'lucide-react';
import { SagaData } from '@/lib/types'; // Ensure types match
import { cn } from '@/lib/utils';
import { consultTheMaster, scoutQuests } from '@/lib/api'; // API Calls

interface SagaDashboardProps {
  data: SagaData;
  repoUrl: string;
}

export function SagaDashboard({ data, repoUrl }: SagaDashboardProps) {
  const [cinematicMode, setCinematicMode] = useState(false);
  
  // State for the "Consult Master" feature
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [masterLore, setMasterLore] = useState<any>(null);
  const [loadingLore, setLoadingLore] = useState(false);
  const [activeTab, setActiveTab] = useState("comic");
  
  // New State for Node-Specific Quests
  const [nodeQuests, setNodeQuests] = useState<any[]>([]);

  const handleNodeClick = async (nodeId: string) => {
    const node = data.map.nodes.find(n => n.id === nodeId);
    if (!node) return;

    setSelectedNodeId(nodeId);
    setLoadingLore(true);
    setMasterLore(null); // Reset previous lore
    
    // Open the side panel implicitly by layout or keep map visible
    // For this design, we will overlay the panel on the right side of the Map area
    
    try {
      // 1. Get Lore
      const loreData = await consultTheMaster(repoUrl, node.files[0] || node.label); // Assuming first file is the key
      setMasterLore(loreData);

      // 2. Get Quests for this node (Optional, if you want node-specific quests)
      const questData = await scoutQuests(repoUrl, node.files[0] || node.label);
      if(questData.quests) setNodeQuests(questData.quests);

    } catch (e) {
      console.error("The Master is silent.", e);
      setMasterLore({ description: "The archives are incomplete. (API Error)" });
    } finally {
      setLoadingLore(false);
    }
  };

  const selectedNode = data.map.nodes.find(n => n.id === selectedNodeId);

  return (
    <div className="relative min-h-screen flex flex-col p-4 md:p-8 overflow-hidden">
      
      {/* Background */}
      <div className="fixed inset-0 z-[-1] overflow-hidden">
        <img src="/assets/bg-dashboard.jpg" className="w-full h-full object-cover animate-ken-burns opacity-90 brightness-75" alt="Ruins" />
        <div className="absolute inset-0 bg-black/20 mix-blend-multiply"></div>
      </div>

      {/* Header */}
      <div className={cn("flex justify-between items-center mb-6 transition-all duration-700", cinematicMode && "opacity-0 -translate-y-10")}>
        <div className="bg-black/20 backdrop-blur-xl p-4 rounded-xl border border-white/10">
          <h1 className="font-headline text-3xl text-white">Repo<span className="text-primary">Saga</span></h1>
        </div>
        <Button variant="outline" size="icon" onClick={() => setCinematicMode(!cinematicMode)} className="bg-black/40 border-primary/50 text-primary rounded-full w-12 h-12">
           {cinematicMode ? <EyeOff /> : <Eye />}
        </Button>
      </div>

      {/* MAIN GRID */}
      <div className={cn("grid grid-cols-1 lg:grid-cols-3 gap-8 flex-grow transition-all duration-700", cinematicMode && "opacity-0 scale-95")}>
        
        {/* LEFT COLUMN: Map & Master Panel */}
        <div className="lg:col-span-2 flex flex-col h-full min-h-[500px] relative">
          <Card className="flex-grow border border-white/10 bg-black/10 backdrop-blur-md shadow-2xl overflow-hidden relative">
            <CardHeader className="bg-black/20 border-b border-white/5 pb-2">
              <CardTitle className="text-white flex items-center gap-2">Realm Map</CardTitle>
            </CardHeader>
            <CardContent className="p-0 relative h-full flex">
               {/* THE MAP */}
               <div className={cn("transition-all duration-500 h-full p-2", selectedNodeId ? "w-2/3" : "w-full")}>
                 <CodebaseMap data={data.map} onNodeSelect={handleNodeClick} />
               </div>

               {/* THE SIDE PANEL (Consult Master) */}
               {selectedNodeId && (
                 <div className="w-1/3 h-full absolute right-0 top-0 bottom-0 z-20 shadow-[-10px_0_20px_rgba(0,0,0,0.5)]">
                    <MasterConsultPanel 
                      node={selectedNode} 
                      lore={masterLore} 
                      loading={loadingLore} 
                      onClose={() => setSelectedNodeId(null)} 
                    />
                 </div>
               )}
            </CardContent>
          </Card>
        </div>
        
        {/* RIGHT COLUMN: Tabs (Saga, Tyrion, Quests) */}
        <div className="lg:col-span-1 h-full min-h-[500px]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4 mb-4 bg-black/20 backdrop-blur-xl border border-white/10 p-1 rounded-xl">
              <TabsTrigger value="comic"><BookOpen className="h-4 w-4" /></TabsTrigger>
              <TabsTrigger value="tyrion"><Wine className="h-4 w-4" /></TabsTrigger> {/* TYRION TAB */}
              <TabsTrigger value="tasks"><ListChecks className="h-4 w-4" /></TabsTrigger>
              <TabsTrigger value="guide"><FileText className="h-4 w-4" /></TabsTrigger>
            </TabsList>
            
            <div className="flex-grow relative">
              <TabsContent value="comic" className="h-full mt-0 absolute inset-0">
                <div className="bg-black/10 backdrop-blur-xl rounded-xl border border-white/10 h-full p-1 overflow-hidden">
                    <ComicViewer data={data.comic} />
                </div>
              </TabsContent>

              {/* TYRION CHAT CONTENT */}
              <TabsContent value="tyrion" className="h-full mt-0 absolute inset-0">
                 <div className="h-full overflow-hidden rounded-xl shadow-2xl">
                    <TyrionChat repoUrl={repoUrl} />
                 </div>
              </TabsContent>
              
              <TabsContent value="tasks" className="h-full mt-0 absolute inset-0">
                 <div className="bg-black/10 backdrop-blur-xl rounded-xl border border-white/10 h-full overflow-y-auto p-2">
                    {/* Combine General Quests + Node Specific Quests */}
                    <TaskList data={{ tasks: [...(data.tasks?.tasks || []), ...nodeQuests] }} repoUrl={repoUrl} />
                 </div>
              </TabsContent>
              
              <TabsContent value="guide" className="h-full mt-0 absolute inset-0">
                 <div className="bg-black/10 backdrop-blur-xl rounded-xl border border-white/10 h-full overflow-y-auto p-2">
                    <OnboardingReadme content={data.readme} />
                 </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}