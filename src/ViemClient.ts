import { PublicClient, createPublicClient, http } from "viem";
import { mainnet, arbitrum, Chain } from "viem/chains";

// get api keys from alchemy
const ALCHEMY_MAINNET = "";
const ALCHEMY_ARBITRUM = "";

enum MainnetBaseUrl {
  ALCHEMY = "https://eth-mainnet.g.alchemy.com/v2/",
}
enum ArbitrumBaseUrl {
  ALCHEMY = "https://arb-mainnet.g.alchemy.com/v2/",
}

export enum ViemClientConfigOptions {
  MAINNET_ALCHEMY = "mainnet:alchemy",
  ARBITRUM_ALCHEMY = "arbitrum-one:alchemy",
}

const ViemClientConfig = {
  "mainnet:alchemy": {
    baseUrl: MainnetBaseUrl.ALCHEMY,
    apiKey: ALCHEMY_MAINNET,
    chain: mainnet,
  },
  "arbitrum-one:alchemy": {
    baseUrl: ArbitrumBaseUrl.ALCHEMY,
    apiKey: ALCHEMY_ARBITRUM,
    chain: arbitrum,
  },
};

export class ViemClient {
  private static instances: Record<string, ViemClient> = {};
  public client: PublicClient;

  private constructor(options: ViemClientConfigOptions) {
    let selectedProvider;
    let config: { baseUrl: string; apiKey: string, chain: Chain};
    switch (options) {
      case ViemClientConfigOptions.MAINNET_ALCHEMY:
        config = ViemClientConfig[options];
        selectedProvider = http(`${config.baseUrl}${config.apiKey}`, {
          batch: true,
        });
        break;
      case ViemClientConfigOptions.ARBITRUM_ALCHEMY:
        config = ViemClientConfig[options];
        selectedProvider = http(`${config.baseUrl}${config.apiKey}`, {
          batch: true,
        });
        break;
      default:
        this.guard(options);
    }
    this.client = createPublicClient({
      chain: config.chain,
      transport: selectedProvider,
    });
  }

  private guard(_value: never): never {
    throw new Error(`Unsupported provider: ${_value}`);
  }

  public static get(option: ViemClientConfigOptions): PublicClient {
    if (!ViemClient.instances[option]) {
      ViemClient.instances[option] = new ViemClient(option);
    }

    return ViemClient.instances[option].client;
  }
}
