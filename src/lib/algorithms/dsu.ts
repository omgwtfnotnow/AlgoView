
// Disjoint Set Union (DSU) or Union-Find
export class DSU {
  private parent: Record<string, string>;
  private rank: Record<string, number>;

  constructor(nodes: string[]) {
    this.parent = {};
    this.rank = {};
    for (const node of nodes) {
      this.parent[node] = node;
      this.rank[node] = 0;
    }
  }

  // Find the representative (root) of the set containing element 'i'
  // with path compression.
  find(i: string): string {
    if (this.parent[i] === i) {
      return i;
    }
    this.parent[i] = this.find(this.parent[i]); // Path compression
    return this.parent[i];
  }

  // Union by rank: Attach smaller rank tree under root of higher rank tree.
  union(i: string, j: string): boolean {
    const rootI = this.find(i);
    const rootJ = this.find(j);

    if (rootI !== rootJ) {
      if (this.rank[rootI] < this.rank[rootJ]) {
        this.parent[rootI] = rootJ;
      } else if (this.rank[rootI] > this.rank[rootJ]) {
        this.parent[rootJ] = rootI;
      } else {
        this.parent[rootJ] = rootI;
        this.rank[rootI]++;
      }
      return true; // Union performed
    }
    return false; // Already in the same set
  }
}
