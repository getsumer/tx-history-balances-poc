import { ExplorerConfig, ExplorerTxHistoryAPI } from "./ExplorerTxHistoryAPI";
import { ViemClient, ViemClientConfigOptions } from "./ViemClient";
import { EtherscanTx, EtherscanTxWithBalance } from "./Models";
import { Hex, formatEther } from "viem";

export class TxHistoryWithBalances {
  constructor() {}

  async run(address: Hex) {
    const etherscan = new ExplorerTxHistoryAPI(
      ExplorerConfig["ethereum:mainnet"]
    );
    const txHistory = await etherscan.getTxHistory(address);
    if (!txHistory) {
      console.error("Failed to fetch tx history");
      return;
    }
    console.log("total tx from explorer", txHistory?.length);

    let data: EtherscanTx[] = txHistory as EtherscanTx[];
    this.orderTransactionsByBlockNumber(data);

    // avoid Alchemy exceeded compute units per second capacity
    // neeed to upgrade Alchemy plan
    const n = 100;
    if (data.length > n) {
      data = data.slice(-n);
    }
    console.log("total tx after slice", data.length);
    let blockNumbers: string[] = [];
    for (let i = 0; i < data.length; i++) {
      const tx = data[i];
      const blockNumber = tx.blockNumber;
      blockNumbers.push(blockNumber);
    }
    const client = ViemClient.get(ViemClientConfigOptions.MAINNET_ALCHEMY);

    // need to improve the async calls
    const balancesPromises = blockNumbers.map((blockNumber) =>
      client
        .getBalance({
          address: address,
          blockNumber: BigInt(blockNumber),
        })
        .then((balance) => ({
          blockNumber,
          balance: formatEther(balance),
          wei: String(balance),
        }))
    );

    const balances = await Promise.all(balancesPromises);

    const txsWithBalances: EtherscanTxWithBalance[] = data.map((tx) => {
      const balance = balances.find(
        (balance) => balance.blockNumber === tx.blockNumber
      );
      return { ...tx, balance: balance?.balance, wei: balance?.wei };
    });

    console.log(txsWithBalances);
    return txsWithBalances;
  }

  private orderTransactionsByBlockNumber(txs: EtherscanTx[]) {
    return txs.sort((a, b) => {
      const aBlockNumber = BigInt(a.blockNumber);
      const bBlockNumber = BigInt(b.blockNumber);
      return aBlockNumber > bBlockNumber ? 1 : -1;
    });
  }
}
