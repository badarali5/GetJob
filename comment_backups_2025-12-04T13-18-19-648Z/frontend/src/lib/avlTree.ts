/**
 * AVL Tree Node for skill-based job search
 * Each node represents a skill, with jobs listed under that node
 */
export interface JobData {
  id: string;
  title: string;
  company: string;
  description: string;
  [key: string]: unknown;
}

export class AVLNode<T> {
  skill: string;
  jobs: T[];
  left: AVLNode<T> | null;
  right: AVLNode<T> | null;
  height: number;

  constructor(skill: string, job?: T) {
    this.skill = skill;
    this.jobs = job ? [job] : [];
    this.left = null;
    this.right = null;
    this.height = 1;
  }
}

/**
 * AVL Tree for skill-based job indexing
 * Maintains balanced tree structure for efficient O(log n) searches
 */
export class AVLTree<T extends { id: string }> {
  root: AVLNode<T> | null;

  constructor() {
    this.root = null;
  }

  /**
   * Get the height of a node
   */
  private getHeight(node: AVLNode<T> | null): number {
    return node ? node.height : 0;
  }

  /**
   * Get the balance factor of a node
   */
  private getBalance(node: AVLNode<T> | null): number {
    return node ? this.getHeight(node.left) - this.getHeight(node.right) : 0;
  }

  /**
   * Update node height based on children
   */
  private updateHeight(node: AVLNode<T>): void {
    node.height = Math.max(this.getHeight(node.left), this.getHeight(node.right)) + 1;
  }

  /**
   * Right rotation
   */
  private rotateRight(y: AVLNode<T>): AVLNode<T> {
    const x = y.left!;
    const T2 = x.right;

    x.right = y;
    y.left = T2;

    this.updateHeight(y);
    this.updateHeight(x);

    return x;
  }

  /**
   * Left rotation
   */
  private rotateLeft(x: AVLNode<T>): AVLNode<T> {
    const y = x.right!;
    const T2 = y.left;

    y.left = x;
    x.right = T2;

    this.updateHeight(x);
    this.updateHeight(y);

    return y;
  }

  /**
   * Insert a skill with associated job
   */
  insert(skill: string, job: T): void {
    this.root = this._insert(this.root, skill, job);
  }

  private _insert(node: AVLNode<T> | null, skill: string, job: T): AVLNode<T> {
    if (!node) {
      return new AVLNode(skill, job);
    }

    const skillLower = skill.toLowerCase();
    const nodeLower = node.skill.toLowerCase();

    if (skillLower < nodeLower) {
      node.left = this._insert(node.left, skill, job);
    } else if (skillLower > nodeLower) {
      node.right = this._insert(node.right, skill, job);
    } else {
      // Skill already exists, add job to existing node
      if (!node.jobs.find(j => j.id === job.id)) {
        node.jobs.push(job);
      }
      return node;
    }

    this.updateHeight(node);
    const balance = this.getBalance(node);

    // Left-Left case
    if (balance > 1 && skillLower < node.left!.skill.toLowerCase()) {
      return this.rotateRight(node);
    }

    // Right-Right case
    if (balance < -1 && skillLower > node.right!.skill.toLowerCase()) {
      return this.rotateLeft(node);
    }

    // Left-Right case
    if (balance > 1 && skillLower > node.left!.skill.toLowerCase()) {
      node.left = this.rotateLeft(node.left!);
      return this.rotateRight(node);
    }

    // Right-Left case
    if (balance < -1 && skillLower < node.right!.skill.toLowerCase()) {
      node.right = this.rotateRight(node.right!);
      return this.rotateLeft(node);
    }

    return node;
  }

  /**
   * Search for jobs by skill
   */
  search(skill: string): T[] {
    const node = this._search(this.root, skill);
    return node ? node.jobs : [];
  }

  private _search(node: AVLNode<T> | null, skill: string): AVLNode<T> | null {
    if (!node) {
      return null;
    }

    const skillLower = skill.toLowerCase();
    const nodeLower = node.skill.toLowerCase();

    if (skillLower < nodeLower) {
      return this._search(node.left, skill);
    } else if (skillLower > nodeLower) {
      return this._search(node.right, skill);
    } else {
      return node;
    }
  }

  /**
   * Get all skills in alphabetical order (in-order traversal)
   */
  getAllSkills(): string[] {
    const skills: string[] = [];
    this._inOrder(this.root, skills);
    return skills;
  }

  private _inOrder(node: AVLNode<T> | null, skills: string[]): void {
    if (!node) return;
    this._inOrder(node.left, skills);
    skills.push(node.skill);
    this._inOrder(node.right, skills);
  }

  /**
   * Get all jobs across all skills
   */
  getAllJobs(): T[] {
    const jobs: T[] = [];
    this._collectAllJobs(this.root, jobs);
    return jobs;
  }

  private _collectAllJobs(node: AVLNode<T> | null, jobs: T[]): void {
    if (!node) return;
    this._collectAllJobs(node.left, jobs);
    jobs.push(...node.jobs);
    this._collectAllJobs(node.right, jobs);
  }

  /**
   * Find skills that start with a prefix (for autocomplete)
   */
  searchByPrefix(prefix: string): string[] {
    const results: string[] = [];
    const lowerPrefix = prefix.toLowerCase();
    this._prefixSearch(this.root, lowerPrefix, results);
    return results;
  }

  private _prefixSearch(node: AVLNode<T> | null, prefix: string, results: string[]): void {
    if (!node) return;
    this._prefixSearch(node.left, prefix, results);
    if (node.skill.toLowerCase().startsWith(prefix)) {
      results.push(node.skill);
    }
    this._prefixSearch(node.right, prefix, results);
  }

  /**
   * Clear the tree
   */
  clear(): void {
    this.root = null;
  }
}
