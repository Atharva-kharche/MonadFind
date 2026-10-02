import { ethers } from "hardhat";

async function main() {
  const contractAddress = "0xe1B1DCEb48B83f9Ba035dF7840683a8826BE5a88";
  
  const MonadFind = await ethers.getContractFactory("MonadFind");
  const contract = MonadFind.attach(contractAddress);
  
  try {
    const count = await contract.getItemCount();
    console.log("getItemCount:", count.toString());
    
    if (count > 0n) {
      try {
        const item0 = await contract.getItem(0);
        console.log("getItem(0):", item0);
      } catch (e: any) {
        console.log("getItem(0) failed:", e.message || e);
      }
      try {
        const itemLatest = await contract.getItem(count);
        console.log(`getItem(${count.toString()}):`, itemLatest);
      } catch (e: any) {
        console.log(`getItem(${count.toString()}) failed:`, e.message || e);
      }
    } else {
        try {
            const item1 = await contract.getItem(1);
            console.log("getItem(1):", item1);
        } catch (e: any) {
            console.log("getItem(1) failed:", e.message || e);
        }
    }
    
    const userAddress = "0x7224B4d7449F77235F2C7d91AD9FeC0Dc8A8E9FE";
    const provider = ethers.provider;
    const nonce = await provider.getTransactionCount(userAddress);
    console.log("User nonce:", nonce);
    
    const explorerApi = `https://testnet-api.monadexplorer.com/api?module=account&action=txlist&address=${userAddress}&page=1&offset=5&sort=desc`;
    const res = await fetch(explorerApi);
    const data = await res.json();
    if (data.status === "1" && data.result.length > 0) {
      const latestTx = data.result[0];
      console.log("Latest TX Hash:", latestTx.hash);
      console.log("Latest TX To:", latestTx.to);
      console.log("Latest TX Status:", latestTx.txreceipt_status === "1" ? "Success" : "Failed");
      console.log("Latest TX Input:", latestTx.input);
      console.log("Latest TX Value:", latestTx.value);
    } else {
      console.log("Explorer API failed or no txs found:", data);
    }
    
  } catch(e) {
    console.error("Error:", e);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
