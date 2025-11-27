/**
 * Max Heap implementation for priority queue operations
 * Used for: Top Jobs, Trending Jobs, Best Applicants ranking
 */

export interface Prioritizable {
  id: string;
  priority: number;
}

/**
 * Max Heap class - maintains heap property where parent >= children
 * Supports O(log n) insert and O(1) peek, O(log n) extract
 */
export class MaxHeap<T extends Prioritizable> {
  private items: T[];

  constructor(items: T[] = []) {
    this.items = [];
    // Build heap from initial items
    items.forEach(item => this.insert(item));
  }

  /**
   * Get parent index
   */
  private getParentIndex(index: number): number {
    return Math.floor((index - 1) / 2);
  }

  /**
   * Get left child index
   */
  private getLeftChildIndex(index: number): number {
    return 2 * index + 1;
  }

  /**
   * Get right child index
   */
  private getRightChildIndex(index: number): number {
    return 2 * index + 2;
  }

  /**
   * Swap two elements
   */
  private swap(index1: number, index2: number): void {
    [this.items[index1], this.items[index2]] = [this.items[index2], this.items[index1]];
  }

  /**
   * Bubble up (sift up) — restore heap property after insertion
   */
  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = this.getParentIndex(index);
      if (this.items[index].priority > this.items[parentIndex].priority) {
        this.swap(index, parentIndex);
        index = parentIndex;
      } else {
        break;
      }
    }
  }

  /**
   * Bubble down (sift down) — restore heap property after extraction
   */
  private bubbleDown(index: number): void {
    while (true) {
      let largestIndex = index;
      const leftChildIndex = this.getLeftChildIndex(index);
      const rightChildIndex = this.getRightChildIndex(index);

      if (
        leftChildIndex < this.items.length &&
        this.items[leftChildIndex].priority > this.items[largestIndex].priority
      ) {
        largestIndex = leftChildIndex;
      }

      if (
        rightChildIndex < this.items.length &&
        this.items[rightChildIndex].priority > this.items[largestIndex].priority
      ) {
        largestIndex = rightChildIndex;
      }

      if (largestIndex !== index) {
        this.swap(index, largestIndex);
        index = largestIndex;
      } else {
        break;
      }
    }
  }

  /**
   * Insert an item — O(log n)
   */
  insert(item: T): void {
    this.items.push(item);
    this.bubbleUp(this.items.length - 1);
  }

  /**
   * Peek at the top item (highest priority) — O(1)
   */
  peek(): T | undefined {
    return this.items[0];
  }

  /**
   * Extract and remove the top item — O(log n)
   */
  extract(): T | undefined {
    if (this.items.length === 0) return undefined;
    if (this.items.length === 1) return this.items.pop();

    const root = this.items[0];
    this.items[0] = this.items.pop()!;
    this.bubbleDown(0);
    return root;
  }

  /**
   * Get all items sorted by priority (descending)
   */
  toArray(): T[] {
    const sorted: T[] = [];
    const tempHeap = new MaxHeap([...this.items]);
    while (tempHeap.size() > 0) {
      const item = tempHeap.extract();
      if (item) sorted.push(item);
    }
    return sorted;
  }

  /**
   * Get size of the heap
   */
  size(): number {
    return this.items.length;
  }

  /**
   * Check if heap is empty
   */
  isEmpty(): boolean {
    return this.items.length === 0;
  }

  /**
   * Clear the heap
   */
  clear(): void {
    this.items = [];
  }
}

/**
 * Min Heap for comparison (useful for bottom-k problems)
 */
export class MinHeap<T extends Prioritizable> {
  private items: T[];

  constructor(items: T[] = []) {
    this.items = [];
    items.forEach(item => this.insert(item));
  }

  private getParentIndex(index: number): number {
    return Math.floor((index - 1) / 2);
  }

  private getLeftChildIndex(index: number): number {
    return 2 * index + 1;
  }

  private getRightChildIndex(index: number): number {
    return 2 * index + 2;
  }

  private swap(index1: number, index2: number): void {
    [this.items[index1], this.items[index2]] = [this.items[index2], this.items[index1]];
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = this.getParentIndex(index);
      if (this.items[index].priority < this.items[parentIndex].priority) {
        this.swap(index, parentIndex);
        index = parentIndex;
      } else {
        break;
      }
    }
  }

  private bubbleDown(index: number): void {
    while (true) {
      let smallestIndex = index;
      const leftChildIndex = this.getLeftChildIndex(index);
      const rightChildIndex = this.getRightChildIndex(index);

      if (
        leftChildIndex < this.items.length &&
        this.items[leftChildIndex].priority < this.items[smallestIndex].priority
      ) {
        smallestIndex = leftChildIndex;
      }

      if (
        rightChildIndex < this.items.length &&
        this.items[rightChildIndex].priority < this.items[smallestIndex].priority
      ) {
        smallestIndex = rightChildIndex;
      }

      if (smallestIndex !== index) {
        this.swap(index, smallestIndex);
        index = smallestIndex;
      } else {
        break;
      }
    }
  }

  insert(item: T): void {
    this.items.push(item);
    this.bubbleUp(this.items.length - 1);
  }

  peek(): T | undefined {
    return this.items[0];
  }

  extract(): T | undefined {
    if (this.items.length === 0) return undefined;
    if (this.items.length === 1) return this.items.pop();

    const root = this.items[0];
    this.items[0] = this.items.pop()!;
    this.bubbleDown(0);
    return root;
  }

  toArray(): T[] {
    const sorted: T[] = [];
    const tempHeap = new MinHeap([...this.items]);
    while (tempHeap.size() > 0) {
      const item = tempHeap.extract();
      if (item) sorted.push(item);
    }
    return sorted;
  }

  size(): number {
    return this.items.length;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  clear(): void {
    this.items = [];
  }
}
