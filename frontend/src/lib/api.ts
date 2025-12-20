// src/lib/api.ts
const API_BASE = 'http://localhost:5000';

/**
 * A robust parser for the specific "TOON" format seen in your logs.
 * format:
 * repoName: <name>
 * mapData:
 * nodes[Count]{headers}:
 * id,label,fantasyName,"description",type
 * edges[Count]{headers}:
 * source,target
 */
function parseToonResponse(text: string) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  
  let repoName = "Unknown Repo";
  const nodes: any[] = [];
  const edges: any[] = [];
  
  let currentSection = "";

  // Helper to parse a CSV line respecting quotes
  // e.g. 'id,name,"desc, with comma",type' -> ['id', 'name', 'desc, with comma', 'type']
  const parseCSVLine = (line: string) => {
    const matches = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        matches.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    matches.push(current.trim()); // Push the last value
    return matches;
  };

  // Helper to generate random coordinates (since backend doesn't send them)
  const getRandomPos = () => Math.floor(Math.random() * 80) + 10; // Keep between 10% and 90%

  for (const line of lines) {
    // 1. Extract Repo Name
    if (line.startsWith('repoName:')) {
      repoName = line.replace('repoName:', '').trim();
      continue;
    }

    // 2. Detect Section Headers
    if (line.startsWith('nodes[')) {
      currentSection = 'nodes';
      continue;
    }
    if (line.startsWith('edges[')) {
      currentSection = 'edges';
      continue;
    }
    if (line.startsWith('mapData:')) continue;

    // 3. Parse Data Lines based on Section
    if (currentSection === 'nodes') {
      // Expected Format: id, file_label, fantasy_name, description, type
      const cols = parseCSVLine(line);
      if (cols.length >= 3) {
        // Map TOON columns to Frontend Node Structure
        nodes.push({
          id: cols[0],                // id
          files: [cols[1]],           // label -> files array
          label: cols[2],             // fantasyName -> label
          tooltip: cols[3] || "",     // description -> tooltip
          type: cols[4] || 'module',  // type
          // Generate pseudo-random positions for the map visualization
          x: getRandomPos(),
          y: getRandomPos(),
          size: 6 // Default size
        });
      }
    } else if (currentSection === 'edges') {
      // Expected Format: source, target
      const cols = parseCSVLine(line);
      if (cols.length >= 2) {
        edges.push({
          from: cols[0],
          to: cols[1],
          weight: 1,
          reason: "Dependency"
        });
      }
    }
  }

  // Construct the final object expected by your Frontend
  return {
    repoName,
    mapData: {
      meta: { repo: repoName, generated_at: new Date().toISOString() },
      nodes,
      edges,
      highlights: {} 
    },
    // Add default fallbacks for parts not yet in backend output
    comic: { panels: [] },
    tasks: { tasks: [] },
    readme: `# ${repoName}\n\nMap successfully decoded from the Archives.`
  };
}

export async function fetchRepoMap(repoUrl: string) {
  // 1. Send as Raw Text (TOON format requirement)
  const toonBody = `repoUrl: "${repoUrl}"`;

  console.log("Summoning map for:", repoUrl);

  const res = await fetch(`${API_BASE}/generate_map`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'text/plain' 
    },
    body: toonBody, 
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("Backend Error:", errText);
    throw new Error(errText || 'Failed to summon the map');
  }

  // 2. Get Raw Text and use our custom parser
  const rawText = await res.text();
  console.log("Raw TOON received:", rawText.slice(0, 100) + "..."); // Debug log
  
  try {
    return parseToonResponse(rawText);
  } catch (e) {
    console.error("Parser failed on input:", rawText);
    throw e;
  }
}

export async function consultTheMaster(repoUrl: string, nodePath: string) {
  const res = await fetch(`${API_BASE}/consult_master`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ repoUrl, nodePath }),
  });
  return res.json();
}

export async function chatWithTyrion(repoUrl: string, message: string, history: any[], filePath?: string) {
  const res = await fetch(`${API_BASE}/chat_with_tyrion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ repoUrl, message, history, filePath }),
  });
  return res.json();
}

export async function scoutQuests(repoUrl: string, nodePath: string) {
    const res = await fetch(`${API_BASE}/scout_quests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoUrl, nodePath }),
    });
    return res.json();
}