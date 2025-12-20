// src/app/saga/page.tsx
import { Suspense } from 'react';
import { SagaDashboard } from '@/components/saga-dashboard'; 
import { SagaLoading } from '@/components/saga-loading';
import { SagaData } from '@/lib/types';
import { fetchRepoMap } from '@/lib/api'; // Ensure this file exists as per previous instructions

// Next.js 15 Async Props Pattern
interface SagaPageProps {
  searchParams: Promise<{
    repoUrl?: string;
  }>;
}

export default async function SagaPage(props: SagaPageProps) {
  const searchParams = await props.searchParams;
  const repoUrl = searchParams.repoUrl;

  if (!repoUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="p-8 text-center border border-destructive/50 rounded-xl bg-destructive/10">
            <h1 className="text-xl font-bold text-destructive mb-2">Access Denied</h1>
            <p className="text-muted-foreground">No Repo URL provided.</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<SagaLoading repoUrl={repoUrl} />}>
      <SagaDataWrapper repoUrl={repoUrl} />
    </Suspense>
  );
}

// Inner component to perform the async fetch from Python Backend
async function SagaDataWrapper({ repoUrl }: { repoUrl: string }) {
  let sagaData: SagaData;

  try {
    // 1. Fetch from Python Backend (http://localhost:5000/generate_map)
    const backendResponse = await fetchRepoMap(repoUrl);

    // 2. Map Backend Response to Frontend 'SagaData' type
    // Note: The backend currently only returns 'mapData' and 'repoName'. 
    // We construct default 'comic' and 'tasks' until the backend fully supports them.
    sagaData = {
      map: backendResponse.mapData,
      readme: backendResponse.readme || `# ${backendResponse.repoName}\n\nMap generated successfully from the Archives.`,
      
      // Placeholders (The backend needs to return these for them to be real)
      comic: {
        panels: [
           { 
             id: 1, 
             title: "The Awakening", 
             narration: "You step into the repository.", 
             dialog: ["System: Welcome user.", "You: Let's see the code."], 
             file: "README.md", 
             snippet: "git clone ...", 
             panel_goal: "Explore the map." 
           }
        ]
      },
      tasks: {
        tasks: [] // Will be populated by the separate 'scoutQuests' call in the Dashboard if needed
      }
    };

  } catch (error) {
    console.error("Failed to summon the Dungeon Map:", error);
    
    // Error State
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
            <div className="p-8 text-center border border-destructive/50 rounded-xl bg-destructive/10 max-w-md">
                <h1 className="text-xl font-bold text-destructive mb-4 font-headline">Connection Severed</h1>
                <p className="text-muted-foreground mb-4">
                    The Python Oracle (Backend) could not be reached. 
                </p>
                <div className="text-xs bg-black/50 p-2 rounded font-mono text-left">
                   <p className="text-red-400">$ Error: Connection Refused</p>
                   <p className="text-gray-500">Ensure Flask is running on port 5000.</p>
                </div>
            </div>
        </div>
    );
  }

  return <SagaDashboard data={sagaData} repoUrl={repoUrl} />;
}