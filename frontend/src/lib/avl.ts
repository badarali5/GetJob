// Lightweight BST-backed stand-in for an AVL tree used only for skill indexing.
// Provides the minimal API expected by the app:
// - new AVLTree<T>()
// - insert(key: string, value: T): void
// - search(key: string): T[]
// - searchByPrefix(prefix: string): string[]
// - getAllSkills(): string[]

export default class AVLTree<T> {
  private map: Map<string, T[]>;

  constructor() {
    this.map = new Map();
  }

  insert(key: string, value: T) {
    if (!key) return;
    const k = key.trim();
    const list = this.map.get(k) || [];
    list.push(value);
    this.map.set(k, list);
  }

  // exact match
  search(key: string): T[] {
    if (!key) return [];
    return this.map.get(key.trim()) || [];
  }

  // return skill keys that start with prefix (case-insensitive), useful for autocomplete
  searchByPrefix(prefix: string): string[] {
    if (!prefix) return [];
    const p = prefix.toLowerCase();
    const out: string[] = [];
    for (const k of this.map.keys()) {
      if (k.toLowerCase().startsWith(p)) out.push(k);
    }
    return out.sort();
  }

  getAllSkills(): string[] {
    return Array.from(this.map.keys()).sort();
  }
}
