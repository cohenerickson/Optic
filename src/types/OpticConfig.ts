export default interface OpticConfig {
  prefix: string;
  bare: string[];
  worker: string;
  client: string;
  shared: string;
  logLevel?: number;
  disableCache?: boolean;
}
