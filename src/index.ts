import { TxHistoryWithBalances } from "./TxHistoryWithBalances";

const queryBalaces = new TxHistoryWithBalances();
const balances = async () => {
  await queryBalaces.run("0x1f9090aaE28b8a3dCeaDf281B0F12828e676c326");
};

balances();
