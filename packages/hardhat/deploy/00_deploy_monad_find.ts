import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys the MonadFind contract using the deployer account.
 *
 * MonadFind has no constructor arguments — it is a permissionless contract
 * with no admin/owner privileges. Anyone can create lost items and anyone
 * with the correct proof can claim rewards.
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployMonadFind: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g. `yarn deploy --network monadTestnet`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
    with a random private key in the .env file (then used on hardhat.config.ts).
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("MonadFind", {
    from: deployer,
    // MonadFind has no constructor arguments
    args: [],
    log: true,
    // autoMine: speeds up deployment on local networks by automatically mining
    // the contract deployment transaction. No effect on live networks.
    autoMine: true,
  });

  console.log("✅ MonadFind contract deployed!");
};

export default deployMonadFind;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags MonadFind
deployMonadFind.tags = ["MonadFind"];
