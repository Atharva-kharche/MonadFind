# MonadFind

> A trust-minimized lost-and-found dApp built on Monad.

## What is MonadFind?

MonadFind is a decentralized lost-and-found application where users can report lost/found items, lock a MON reward in a smart contract, and allow a claimant to receive the reward after providing the required ownership proof. 

The smart contract verifies possession of the secret/proof commitment supplied by the creator, ensuring the reward can only be claimed by the legitimate person holding the secret.

## How it works

1. Creator reports an item.
2. Creator deposits a MON reward into the smart contract.
3. The item and proof commitment are recorded on-chain.
4. A claimant submits the required proof.
5. The smart contract verifies the proof.
6. The reward is released automatically.
7. The item changes from OPEN to RETURNED.

## Why blockchain?

MonadFind uses a smart contract to guarantee the safety of rewards:
- **Reward escrow**: Funds are locked inside the contract safely until claimed.
- **Transparent state**: All items and their statuses are publicly readable.
- **Automatic payout**: The contract releases funds directly to the claimant without a middleman.
- **No centralized server**: We don't hold the funds; the blockchain does.
- **Verifiable transactions**: The entire lifecycle of an item is cryptographically secured.

## Why Monad?

MonadFind's smart contract is deployed on the Monad blockchain (Testnet), allowing it to process these item creation and claim transactions extremely quickly and efficiently.

## Tech Stack

- Next.js
- React
- TypeScript
- Solidity
- Hardhat
- Wagmi
- Viem
- RainbowKit
- OpenZeppelin
- Monad Testnet

## Project Structure

MonadFind consists of two main packages:
- `packages/hardhat/contracts/MonadFind.sol`: The core smart contract.
- `packages/hardhat/deploy/`: Deployment scripts.
- `packages/hardhat/test/MonadFind.test.ts`: Smart contract tests verifying all functionality.
- `packages/nextjs/app/`: The Next.js frontend pages (e.g. create, my-items, item details).
- `packages/nextjs/components/`: Reusable React components.
- `packages/nextjs/contracts/deployedContracts.ts`: The automatically generated ABI and deployed contract addresses.

## Running locally

To run MonadFind locally against the Monad Testnet:

1. Clone the repository and install dependencies:
```bash
yarn install
```

2. Start the Next.js development server:
```bash
yarn start
```

3. Open `http://localhost:3000` in your browser.

*Note: The frontend will automatically connect to the already deployed MonadFind contract on the Monad Testnet.*

## Smart Contract

The `MonadFind.sol` smart contract includes:
- `createItem`: Records item details, proof hash, and escrows the MON reward.
- `claimItem`: Verifies the submitted secret against the proof hash, marks the item as RETURNED, and releases the MON reward to the claimant.
- **Security features**: Reentrancy protection and double-payout protection are included.

## Testing

The MonadFind smart contract test suite includes extensive testing for all flows.
Run the tests with:
```bash
yarn workspace @monadfind/hardhat test
```
*(46/46 Hardhat tests passing successfully)*

## Security

- **Never commit private keys.**
- **Never share seed phrases.**
- **Ownership proof should remain private.** The smart contract verifies the submitted secret (which hashes to the proof), it does not verify physical ownership.
- Testnet assets are used for development/demo. Please use the Monad Testnet for safe testing.

## Open Source / Attribution

This project uses open-source development infrastructure/components from the Scaffold-ETH-Monad ecosystem for Next.js, Wagmi integration, and Hardhat deployment. The application logic, `MonadFind.sol` smart contract, UI design, product concept, and user flows were all custom-built specifically for this MonadFind project.
