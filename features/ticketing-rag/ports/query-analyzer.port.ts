export enum QueryType {
  SEMANTIC = "semantic", // Vector search for "why", "what", semantic understanding
  QUANTITATIVE = "quantitative", // SQL for counts, aggregations, statistics
  HYBRID = "hybrid", // Both semantic and quantitative
}

export interface QueryAnalysis {
  queryType: QueryType;
  intent: string; // What the user wants to know
  needsVectorSearch: boolean;
  needsSQLQuery: boolean;
  sqlQuery?: string; // Generated SQL query if needed
  vectorSearchQuery?: string; // Reformulated query for vector search
  topK?: number; // Number of results for vector search
}

/**
 * Port for analyzing user queries using LLM
 * Determines whether to use vector search, SQL, or both
 */
export interface QueryAnalyzerPort {
  /**
   * Analyze user query and determine execution strategy
   * @param query - User's natural language query
   * @param availableKBs - Knowledge bases available for querying
   */
  analyze(query: string, availableKBs: string[]): Promise<QueryAnalysis>;
}
