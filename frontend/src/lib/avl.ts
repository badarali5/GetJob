

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
