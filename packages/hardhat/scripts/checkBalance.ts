import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const address = await deployer.getAddress();
  const balance = await ethers.provider.getBalance(address);
  console.log(`Deployer Address: ${address}`);
  console.log(`Deployer Balance: ${ethers.formatEther(balance)} MON`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
