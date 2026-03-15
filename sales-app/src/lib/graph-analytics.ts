import { EcosystemRelationship, EntityType } from './ecosystem-data';

interface GraphNode {
    id: string; // "Type:Name" format
    label: string; // The Name itself
    type: EntityType;
}

interface GraphData {
    nodes: Map<string, GraphNode>;
    edges: Map<string, string[]>; // Adjacency list: Map<sourceId, targetId[]>
}

/**
 * Helper: Build a bidirectional adjacency list from Ecosystem Relationships
 */
export function buildGraph(relationships: EcosystemRelationship[]): GraphData {
    const nodes = new Map<string, GraphNode>();
    const edges = new Map<string, string[]>();

    const addNode = (type: EntityType, label: string) => {
        const id = `${type}:${label}`;
        if (!nodes.has(id)) {
            nodes.set(id, { id, label, type });
        }
        if (!edges.has(id)) {
            edges.set(id, []);
        }
        return id;
    };

    relationships.forEach(rel => {
        const allowedTypes = ['Vendor', 'Partner', 'Technology', 'Industry'];
        if (!allowedTypes.includes(rel.source_type) || !allowedTypes.includes(rel.target_type)) return;

        const srcId = addNode(rel.source_type, rel.source_id);
        const tgtId = addNode(rel.target_type, rel.target_id);

        // Undirected graph logic for clustering / paths
        edges.get(srcId)?.push(tgtId);
        edges.get(tgtId)?.push(srcId); // Ensure symmetry
    });

    // Remove duplicates from adjacency list
    for (const [key, neighbors] of edges.entries()) {
        edges.set(key, Array.from(new Set(neighbors)));
    }

    return { nodes, edges };
}

// ── 1. CENTRALITY ENGINE ──────────────────────────────────────

export interface CentralityScores {
    [nodeId: string]: number;
}

export function calculateDegreeCentrality(graph: GraphData): CentralityScores {
    const scores: CentralityScores = {};
    for (const [nodeId, neighbors] of graph.edges.entries()) {
        scores[nodeId] = neighbors.length;
    }
    return normalizeScores(scores);
}

// Simple normalization helper (0 to 1)
function normalizeScores(scores: CentralityScores): CentralityScores {
    const values = Object.values(scores);
    if (values.length === 0) return scores;
    const max = Math.max(...values);
    if (max === 0) return scores;

    const normalized: CentralityScores = {};
    for (const id in scores) {
        normalized[id] = scores[id] / max;
    }
    return normalized;
}

// ── 2. COMMUNITY DETECTION (Simplified Label Propagation) ─────

export interface CommunityMap {
    [nodeId: string]: number; // NodeId -> Community ID
}

export function detectCommunities(graph: GraphData, maxIterations = 20): CommunityMap {
    const communities: CommunityMap = {};
    const nodes = Array.from(graph.nodes.keys());

    // Init: Each node is its own community
    nodes.forEach((id, index) => { communities[id] = index; });

    let changed = true;
    let iteration = 0;

    // Label propagation algorithm
    while (changed && iteration < maxIterations) {
        changed = false;

        // Shuffle nodes to prevent oscillation
        const shuffled = [...nodes].sort(() => Math.random() - 0.5);

        for (const nodeId of shuffled) {
            const neighbors = graph.edges.get(nodeId) || [];
            if (neighbors.length === 0) continue;

            // Count frequency of neighboring communities
            const counts: Record<number, number> = {};
            for (const neighborId of neighbors) {
                const c = communities[neighborId];
                counts[c] = (counts[c] || 0) + 1;
            }

            // Find most frequent community (break ties randomly)
            let maxCount = -1;
            let bestCommunities: number[] = [];

            for (const c in counts) {
                const count = counts[c];
                if (count > maxCount) {
                    maxCount = count;
                    bestCommunities = [Number(c)];
                } else if (count === maxCount) {
                    bestCommunities.push(Number(c));
                }
            }

            const chosenCommunity = bestCommunities[Math.floor(Math.random() * bestCommunities.length)];

            if (communities[nodeId] !== chosenCommunity) {
                communities[nodeId] = chosenCommunity;
                changed = true;
            }
        }
        iteration++;
    }

    return communities;
}


// ── 3. SHORTEST PATH (BFS) ────────────────────────────────────

export interface PathResult {
    path: string[];
    distance: number;
}

export function findShortestPath(graph: GraphData, startId: string, endId: string): PathResult | null {
    if (!graph.nodes.has(startId) || !graph.nodes.has(endId)) return null;
    if (startId === endId) return { path: [startId], distance: 0 };

    const queue: string[] = [startId];
    const visited = new Set<string>([startId]);
    const parent = new Map<string, string>(); // Maps node to its predecessor

    while (queue.length > 0) {
        const currentId = queue.shift()!;

        if (currentId === endId) {
            // Reconstruct path
            const path = [endId];
            let curr = endId;
            while (parent.has(curr)) {
                curr = parent.get(curr)!;
                path.unshift(curr);
            }
            return { path, distance: path.length - 1 };
        }

        const neighbors = graph.edges.get(currentId) || [];
        for (const neighborId of neighbors) {
            if (!visited.has(neighborId)) {
                visited.add(neighborId);
                parent.set(neighborId, currentId);
                queue.push(neighborId);
            }
        }
    }

    return null; // No path found
}


// ── 4. BRIDGE DETECTION ───────────────────────────────────────
// Identifies nodes that connect between identified communities

export interface BridgeNode {
    id: string;
    crossesCommunities: Set<number>;
    bridgeScore: number; // The number of distinct communities it borders
}

export function detectBridges(graph: GraphData, communities: CommunityMap): BridgeNode[] {
    const bridges: BridgeNode[] = [];

    for (const [nodeId, neighbors] of graph.edges.entries()) {
        const nodeCommunity = communities[nodeId];
        const borderingCommunities = new Set<number>();

        for (const n of neighbors) {
            const nComm = communities[n];
            if (nComm !== nodeCommunity) {
                borderingCommunities.add(nComm);
            }
        }

        if (borderingCommunities.size > 0) {
            borderingCommunities.add(nodeCommunity); // Also counts its own
            bridges.push({
                id: nodeId,
                crossesCommunities: borderingCommunities,
                bridgeScore: borderingCommunities.size
            });
        }
    }

    // Sort by most communities bridged
    return bridges.sort((a, b) => b.bridgeScore - a.bridgeScore);
}
