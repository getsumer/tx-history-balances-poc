// get api keys from explorers
const ETHERSCAN_MAINNET = "";
const ARBISCAN_MAINNET = "";

export const ExplorerConfig = {
  "ethereum:mainnet": {
    apiKey: ETHERSCAN_MAINNET,
    baseUrl: "https://api.etherscan.io/api",
  },
  "arbitrum-one:mainnet": {
    apiKey: ARBISCAN_MAINNET,
    baseUrl: "https://api.arbiscan.io/api",
  },
};

export class ExplorerTxHistoryAPI {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: { apiKey: string; baseUrl: string }) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl;
  }

  async getTxHistory(address: string): Promise<unknown[] | undefined> {
    const txlistUrl = `${this.baseUrl}?module=account&action=txlist&address=${address}&startblock=0&endblock=latest&sort=asc&apikey=${this.apiKey}`;
    const internalTxlistUrl = `${this.baseUrl}?module=account&action=txlistinternal&address=${address}&startblock=0&endblock=latest&sort=asc&apikey=${this.apiKey}`;
    try {
      const responses = await Promise.all([
        fetch(txlistUrl),
        fetch(internalTxlistUrl),
      ]);
      const [txlistRes, internalTxlistRes] = responses;
      const txlist = await txlistRes.json();
      const internalTxlist = await internalTxlistRes.json();

      return [...txlist?.result, ...internalTxlist?.result];
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }
}
