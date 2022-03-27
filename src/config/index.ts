export { argv } from './argv';
export { Inquerer } from './inquerer';

interface IConfig {
  queries: string[];
  searches: number;
  branch: number;
  depth: number;
  gl?: string;
  language?: string;
}

// * defaults
export const defaults = {
  maxQueries: 10,
  searches: 2,
  maxSearches: 5,
  branch: 2,
  maxBranch: 5,
  depth: 2,
  maxDepth: 5,
};

export let config: IConfig = {
  queries: [],
  searches: defaults.searches,
  branch: defaults.branch,
  depth: defaults.depth,
};

export const setConfig = (values: any) => {
  if (!values.queries) {
    throw new Error('At least one query must be defined');
  }

  values.queries = Array.isArray(values.queries) ? values.queries : values.queries.split(',');

  if (values.queries.length === 0) {
    throw new Error('At least one query must be defined');
  }

  if (values.queries.length > defaults.maxQueries) {
    console.warn(`Limited to ${defaults.maxQueries} queries`);
    values.queries = values.queries.slice(0, defaults.maxQueries);
  }

  const queries: string[] = [];
  values.queries.forEach((query: any, index: number) => {
    if (typeof query !== 'string') {
      console.warn(`A query must be a string. Query [${index}] is ${typeof query}`);
      return;
    }
    queries.push(query);
  });

  let searches = values.searches ?? defaults.searches;
  if (searches > defaults.maxSearches) {
    console.warn(`Limited to ${defaults.maxSearches} searches`);
    searches = defaults.maxSearches;
  }

  let branch = values.branch ?? defaults.branch;
  if (branch > defaults.maxBranch) {
    console.warn(`Limited to ${defaults.maxBranch} branches`);
    branch = defaults.maxBranch;
  }

  let depth = values.depth ?? defaults.depth;
  if (depth > defaults.maxDepth) {
    console.warn(`Limited to depth ${defaults.maxDepth}`);
    depth = defaults.maxDepth;
  }

  const gl = values.gl !== '' ? values.gl : undefined;
  const language = values.language !== '' ? values.language : undefined;

  config = { queries, searches, branch, depth, gl, language };

  return config;
};
