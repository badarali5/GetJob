export const PROMPTS = [
  "Great learning opportunity with mentorship and hands-on projects.",
  "Work with a collaborative team on impactful products.",
  "Flexible hours and strong emphasis on work-life balance.",
  "Fast-paced startup environment with growth potential.",
  "Cutting-edge tech stack and interesting engineering challenges.",
  "Chance to contribute to open-source initiatives and community.",
  "Strong emphasis on career development and training.",
  "Opportunity to work remotely with occasional on-site meetups.",
  "Competitive compensation and performance bonuses.",
  "Exposure to large-scale systems and cloud-native practices.",
  "Hands-on mentorship from senior engineers and leads.",
  "Be part of a diverse team solving real-world problems.",
];

const MAP_KEY = 'gj_jobPromptMap_v1';
const COUNT_KEY = 'gj_promptCounts_v1';

function loadMap(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(MAP_KEY) || '{}');
  } catch {
    return {};
  }
}
function saveMap(m: Record<string, number>) {
  try { localStorage.setItem(MAP_KEY, JSON.stringify(m)); } catch {};
}
function loadCounts(): number[] {
  try {
    const v = JSON.parse(localStorage.getItem(COUNT_KEY) || 'null');
    if (Array.isArray(v)) return v;
  } catch {}
  return new Array(PROMPTS.length).fill(0);
}
function saveCounts(c: number[]) {
  try { localStorage.setItem(COUNT_KEY, JSON.stringify(c)); } catch {};
}

export function getOrAssignPromptIndex(jobId: string): number {
  const map = loadMap();
  const counts = loadCounts();
  if (map[jobId] !== undefined) return map[jobId];
  const indices = [...Array(PROMPTS.length).keys()];
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  let chosen = -1;
  for (const idx of indices) {
    if (counts[idx] < 5) { chosen = idx; break; }
  }
  if (chosen === -1) {
    let min = Infinity; let minIdx = 0;
    counts.forEach((c, i) => { if (c < min) { min = c; minIdx = i; } });
    chosen = minIdx;
  }

  map[jobId] = chosen;
  counts[chosen] = (counts[chosen] || 0) + 1;
  saveMap(map);
  saveCounts(counts);
  return chosen;
}

export function getPromptForJob(jobId: string): string {
  const idx = getOrAssignPromptIndex(jobId);
  return PROMPTS[idx] || PROMPTS[0];
}
export function reorderJobsToAvoidAdjacentDuplicates<T extends { id: string }>(jobs: T[]): T[] {
  if (!jobs || jobs.length <= 1) return jobs.slice();
  const groups = new Map<number, T[]>();
  for (const job of jobs) {
    const idx = getOrAssignPromptIndex(job.id.toString());
    const arr = groups.get(idx) || [];
    arr.push(job);
    groups.set(idx, arr);
  }
  const heap: Array<{idx:number, arr:T[]}> = [];
  groups.forEach((arr, idx) => heap.push({idx, arr: arr.slice()}));

  const result: T[] = [];
  let prevIdx: number | null = null;

  while (heap.length > 0) {
    heap.sort((a,b) => b.arr.length - a.arr.length);
    let pickIndex = -1;
    for (let i=0;i<heap.length;i++) {
      if (heap[i].idx !== prevIdx) { pickIndex = i; break; }
    }
    if (pickIndex === -1) pickIndex = 0; // forced to pick same as prev if unavoidable

    const picked = heap[pickIndex];
    result.push(picked.arr.shift() as T);
    prevIdx = picked.idx;
    if (picked.arr.length === 0) {
      heap.splice(pickIndex, 1);
    }
  }

  return result;
}
