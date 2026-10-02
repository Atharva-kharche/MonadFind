import { ethers } from "hardhat";
import { expect } from "chai";

/**
 * MonadFind Test Suite
 *
 * Tests cover:
 *  1. Contract deployment
 *  2. Creating items with MON reward
 *  3. Correct item information storage
 *  4. Rejecting zero reward
 *  5. Correct proof verification
 *  6. Successful claim
 *  7. Reward transferred to claimant
 *  8. Item becomes RETURNED
 *  9. Invalid proof rejected
 * 10. Double claim rejected
 * 11. Invalid/nonexistent item rejected
 * 12. Multiple independent items work correctly
 * 13. Escrowed rewards cannot be withdrawn by arbitrary users
 *
 * PROOF FLOW REMINDER:
 *   - `proof` is a bytes32 secret known only to the item owner
 *   - `proofHash` = keccak256(abi.encodePacked(proof)), stored on-chain
 *   - To claim, the finder submits `proof`. The contract checks:
 *       keccak256(abi.encodePacked(submitted_proof)) == stored_proofHash
 */
describe("MonadFind", function () {
  // ----- Shared variables -----
  let monadFind: any;
  let owner: any;    // The person who lost the item
  let finder: any;   // The person who found the item
  let stranger: any; // An unrelated third party

  // ----- Test proof values -----
  // In a real scenario, the "proof" could be derived from a serial number,
  // a secret phrase, or any knowledge that only the true owner has.
  const proof = ethers.id("serial-number-ABC123XYZ"); // bytes32 secret
  const proofHash = ethers.keccak256(proof);           // keccak256(abi.encodePacked(proof))
  const wrongProof = ethers.id("wrong-guess-999");     // An incorrect secret

  // ----- Test reward amounts -----
  const reward = ethers.parseEther("1.0");
  const smallReward = ethers.parseEther("0.01");

  // ----- Test item details -----
  const title = "Blue Backpack";
  const description = "Lost near Monad HQ on October 1st. Has a purple keychain attached.";
  const imageUri = "ipfs://QmExampleHash123";

  // Deploy a fresh contract before each test
  beforeEach(async function () {
    [owner, finder, stranger] = await ethers.getSigners();

    const MonadFindFactory = await ethers.getContractFactory("MonadFind");
    monadFind = await MonadFindFactory.deploy();
    await monadFind.waitForDeployment();
  });

  // ============================================================
  //  1. CONTRACT DEPLOYMENT
  // ============================================================
  describe("1. Contract Deployment", function () {
    it("should deploy successfully with zero items", async function () {
      const count = await monadFind.getItemCount();
      expect(count).to.equal(0);
    });

    it("should have zero contract balance on deploy", async function () {
      const balance = await ethers.provider.getBalance(await monadFind.getAddress());
      expect(balance).to.equal(0);
    });
  });

  // ============================================================
  //  2 & 3. CREATING ITEMS
  // ============================================================
  describe("2. Creating Items with MON Reward", function () {
    it("should create an item and emit ItemCreated event", async function () {
      await expect(
        monadFind.connect(owner).createItem(title, description, imageUri, proofHash, {
          value: reward,
        }),
      )
        .to.emit(monadFind, "ItemCreated")
        .withArgs(1, owner.address, reward);
    });

    it("should increment item count after creation", async function () {
      await monadFind.connect(owner).createItem(title, description, imageUri, proofHash, {
        value: reward,
      });

      expect(await monadFind.getItemCount()).to.equal(1);
    });

    it("should escrow the reward inside the contract", async function () {
      await monadFind.connect(owner).createItem(title, description, imageUri, proofHash, {
        value: reward,
      });

      const contractBalance = await ethers.provider.getBalance(await monadFind.getAddress());
      expect(contractBalance).to.equal(reward);
    });
  });

  // ============================================================
  //  3. CORRECT ITEM INFORMATION STORAGE
  // ============================================================
  describe("3. Correct Item Information Storage", function () {
    beforeEach(async function () {
      await monadFind.connect(owner).createItem(title, description, imageUri, proofHash, {
        value: reward,
      });
    });

    it("should store the correct item ID", async function () {
      const item = await monadFind.getItem(1);
      expect(item.id).to.equal(1);
    });

    it("should store the correct creator address", async function () {
      const item = await monadFind.getItem(1);
      expect(item.creator).to.equal(owner.address);
    });

    it("should store the correct title", async function () {
      const item = await monadFind.getItem(1);
      expect(item.title).to.equal(title);
    });

    it("should store the correct description", async function () {
      const item = await monadFind.getItem(1);
      expect(item.description).to.equal(description);
    });

    it("should store the correct image URI", async function () {
      const item = await monadFind.getItem(1);
      expect(item.imageUri).to.equal(imageUri);
    });

    it("should store the correct proof hash", async function () {
      const item = await monadFind.getItem(1);
      expect(item.proofHash).to.equal(proofHash);
    });

    it("should store the correct reward amount", async function () {
      const item = await monadFind.getItem(1);
      expect(item.reward).to.equal(reward);
    });

    it("should have zero-address claimant initially", async function () {
      const item = await monadFind.getItem(1);
      expect(item.claimant).to.equal(ethers.ZeroAddress);
    });

    it("should have a valid creation timestamp", async function () {
      const item = await monadFind.getItem(1);
      expect(item.createdAt).to.be.greaterThan(0);
    });

    it("should have OPEN status initially", async function () {
      const item = await monadFind.getItem(1);
      expect(item.status).to.equal(0); // Status.OPEN
    });
  });

  // ============================================================
  //  4. REJECTING ZERO REWARD
  // ============================================================
  describe("4. Rejecting Zero Reward", function () {
    it("should reject item creation with zero MON", async function () {
      await expect(
        monadFind.connect(owner).createItem(title, description, imageUri, proofHash, {
          value: 0,
        }),
      ).to.be.revertedWith("Reward must be greater than zero");
    });

    it("should reject item creation with empty title", async function () {
      await expect(
        monadFind.connect(owner).createItem("", description, imageUri, proofHash, {
          value: reward,
        }),
      ).to.be.revertedWith("Title cannot be empty");
    });

    it("should reject item creation with zero proof hash", async function () {
      await expect(
        monadFind.connect(owner).createItem(title, description, imageUri, ethers.ZeroHash, {
          value: reward,
        }),
      ).to.be.revertedWith("Proof hash cannot be zero");
    });
  });

  // ============================================================
  //  5, 6, 7, 8. CLAIMING ITEMS
  // ============================================================
  describe("5-8. Claiming Items (Proof, Claim, Reward, Status)", function () {
    beforeEach(async function () {
      // Create an item before each claim test
      await monadFind.connect(owner).createItem(title, description, imageUri, proofHash, {
        value: reward,
      });
    });

    // 5. Correct proof verification
    it("should accept a valid proof", async function () {
      // This should NOT revert — valid proof is accepted
      await expect(monadFind.connect(finder).claimItem(1, proof)).to.not.be.reverted;
    });

    // 6. Successful claim emits event
    it("should emit ItemClaimed event on successful claim", async function () {
      await expect(monadFind.connect(finder).claimItem(1, proof))
        .to.emit(monadFind, "ItemClaimed")
        .withArgs(1, finder.address, reward);
    });

    // 7. Reward transferred to claimant
    it("should transfer the escrowed reward to the claimant", async function () {
      await expect(monadFind.connect(finder).claimItem(1, proof)).to.changeEtherBalance(
        finder,
        reward,
      );
    });

    it("should decrease contract balance by the reward amount", async function () {
      await expect(monadFind.connect(finder).claimItem(1, proof)).to.changeEtherBalance(
        monadFind,
        -reward,
      );
    });

    // 8. Item becomes RETURNED
    it("should mark item status as RETURNED after successful claim", async function () {
      await monadFind.connect(finder).claimItem(1, proof);

      const item = await monadFind.getItem(1);
      expect(item.status).to.equal(1); // Status.RETURNED
    });

    it("should record the claimant address after successful claim", async function () {
      await monadFind.connect(finder).claimItem(1, proof);

      const item = await monadFind.getItem(1);
      expect(item.claimant).to.equal(finder.address);
    });

    it("should preserve the original reward amount after claim", async function () {
      await monadFind.connect(finder).claimItem(1, proof);

      const item = await monadFind.getItem(1);
      // Reward value stays for historical reference, status prevents double-payout
      expect(item.reward).to.equal(reward);
    });
  });

  // ============================================================
  //  9. INVALID PROOF REJECTED
  // ============================================================
  describe("9. Invalid Proof Rejected", function () {
    beforeEach(async function () {
      await monadFind.connect(owner).createItem(title, description, imageUri, proofHash, {
        value: reward,
      });
    });

    it("should reject claim with wrong proof", async function () {
      await expect(monadFind.connect(finder).claimItem(1, wrongProof)).to.be.revertedWith(
        "Invalid ownership proof",
      );
    });

    it("should reject claim with the proofHash itself (hash of hash is wrong)", async function () {
      // A common mistake: submitting the hash instead of the secret
      await expect(monadFind.connect(finder).claimItem(1, proofHash)).to.be.revertedWith(
        "Invalid ownership proof",
      );
    });

    it("should reject claim with zero bytes proof", async function () {
      await expect(monadFind.connect(finder).claimItem(1, ethers.ZeroHash)).to.be.revertedWith(
        "Invalid ownership proof",
      );
    });
  });

  // ============================================================
  //  10. DOUBLE CLAIM REJECTED
  // ============================================================
  describe("10. Double Claim Rejected", function () {
    beforeEach(async function () {
      await monadFind.connect(owner).createItem(title, description, imageUri, proofHash, {
        value: reward,
      });
      // First valid claim
      await monadFind.connect(finder).claimItem(1, proof);
    });

    it("should reject a second claim by a different user", async function () {
      await expect(monadFind.connect(stranger).claimItem(1, proof)).to.be.revertedWith(
        "Item is not open for claims",
      );
    });

    it("should reject a second claim by the same user", async function () {
      await expect(monadFind.connect(finder).claimItem(1, proof)).to.be.revertedWith(
        "Item is not open for claims",
      );
    });

    it("should not change contract balance on rejected double claim", async function () {
      const balanceBefore = await ethers.provider.getBalance(await monadFind.getAddress());

      await expect(monadFind.connect(stranger).claimItem(1, proof)).to.be.reverted;

      const balanceAfter = await ethers.provider.getBalance(await monadFind.getAddress());
      expect(balanceAfter).to.equal(balanceBefore);
    });
  });

  // ============================================================
  //  11. INVALID / NONEXISTENT ITEM REJECTED
  // ============================================================
  describe("11. Invalid / Nonexistent Item Rejected", function () {
    it("should reject claim for item ID 0", async function () {
      await expect(monadFind.connect(finder).claimItem(0, proof)).to.be.revertedWith(
        "Item does not exist",
      );
    });

    it("should reject claim for a nonexistent item ID", async function () {
      await expect(monadFind.connect(finder).claimItem(999, proof)).to.be.revertedWith(
        "Item does not exist",
      );
    });

    it("should reject getItem for a nonexistent item ID", async function () {
      await expect(monadFind.getItem(999)).to.be.revertedWith("Item does not exist");
    });

    it("should reject getItem for item ID 0", async function () {
      await expect(monadFind.getItem(0)).to.be.revertedWith("Item does not exist");
    });
  });

  // ============================================================
  //  12. MULTIPLE INDEPENDENT ITEMS
  // ============================================================
  describe("12. Multiple Independent Items", function () {
    const proof2 = ethers.id("second-secret-WALLET-RED");
    const proofHash2 = ethers.keccak256(proof2);
    const reward2 = ethers.parseEther("2.5");

    const proof3 = ethers.id("third-secret-KEYS-SILVER");
    const proofHash3 = ethers.keccak256(proof3);
    const reward3 = ethers.parseEther("0.5");

    beforeEach(async function () {
      // Create three items from different users
      await monadFind
        .connect(owner)
        .createItem("Blue Backpack", "Lost near the park", imageUri, proofHash, { value: reward });

      await monadFind
        .connect(stranger)
        .createItem("Red Wallet", "Dropped at coffee shop", "ipfs://wallet", proofHash2, {
          value: reward2,
        });

      await monadFind
        .connect(owner)
        .createItem("Silver Keys", "Left at the gym", "ipfs://keys", proofHash3, {
          value: reward3,
        });
    });

    it("should track correct item count", async function () {
      expect(await monadFind.getItemCount()).to.equal(3);
    });

    it("should assign sequential IDs", async function () {
      const item1 = await monadFind.getItem(1);
      const item2 = await monadFind.getItem(2);
      const item3 = await monadFind.getItem(3);
      expect(item1.id).to.equal(1);
      expect(item2.id).to.equal(2);
      expect(item3.id).to.equal(3);
    });

    it("should escrow total rewards in the contract", async function () {
      const totalEscrowed = reward + reward2 + reward3;
      const contractBalance = await ethers.provider.getBalance(await monadFind.getAddress());
      expect(contractBalance).to.equal(totalEscrowed);
    });

    it("should allow claiming items independently", async function () {
      // Claim item 2 first
      await monadFind.connect(finder).claimItem(2, proof2);

      // Items 1 and 3 should still be OPEN
      const item1 = await monadFind.getItem(1);
      const item3 = await monadFind.getItem(3);
      expect(item1.status).to.equal(0); // OPEN
      expect(item3.status).to.equal(0); // OPEN

      // Item 2 should be RETURNED
      const item2 = await monadFind.getItem(2);
      expect(item2.status).to.equal(1); // RETURNED
    });

    it("should maintain correct contract balance after partial claims", async function () {
      // Claim item 1
      await monadFind.connect(finder).claimItem(1, proof);

      // Contract should still hold reward2 + reward3
      const remaining = reward2 + reward3;
      const contractBalance = await ethers.provider.getBalance(await monadFind.getAddress());
      expect(contractBalance).to.equal(remaining);
    });

    it("should not allow using one item's proof on another item", async function () {
      // Try to claim item 2 with item 1's proof
      await expect(monadFind.connect(finder).claimItem(2, proof)).to.be.revertedWith(
        "Invalid ownership proof",
      );
    });
  });

  // ============================================================
  //  13. SECURITY — ESCROWED REWARDS PROTECTION
  // ============================================================
  describe("13. Escrowed Rewards Cannot Be Withdrawn by Arbitrary Users", function () {
    beforeEach(async function () {
      await monadFind.connect(owner).createItem(title, description, imageUri, proofHash, {
        value: reward,
      });
    });

    it("should hold escrowed MON in the contract", async function () {
      const contractBalance = await ethers.provider.getBalance(await monadFind.getAddress());
      expect(contractBalance).to.equal(reward);
    });

    it("should not release reward to a user with wrong proof", async function () {
      await expect(monadFind.connect(stranger).claimItem(1, wrongProof)).to.be.revertedWith(
        "Invalid ownership proof",
      );

      // Verify contract still holds the funds
      const contractBalance = await ethers.provider.getBalance(await monadFind.getAddress());
      expect(contractBalance).to.equal(reward);
    });

    it("should not allow sending raw ETH to the contract", async function () {
      // Contract has no receive() or fallback(), so raw ETH transfers should fail
      await expect(
        owner.sendTransaction({
          to: await monadFind.getAddress(),
          value: ethers.parseEther("1.0"),
        }),
      ).to.be.reverted;
    });

    it("should not have any admin/owner withdrawal function", async function () {
      // The deployer (owner) should not be able to claim without the correct proof
      await expect(monadFind.connect(owner).claimItem(1, wrongProof)).to.be.revertedWith(
        "Invalid ownership proof",
      );
    });

    it("should only release exact reward amount, not more", async function () {
      // Create a second item to have extra funds in the contract
      const proof2 = ethers.id("second-proof");
      const proofHash2 = ethers.keccak256(proof2);
      await monadFind
        .connect(stranger)
        .createItem("Second Item", "Another lost item", "", proofHash2, {
          value: smallReward,
        });

      const totalEscrowed = reward + smallReward;
      const contractBalanceBefore = await ethers.provider.getBalance(await monadFind.getAddress());
      expect(contractBalanceBefore).to.equal(totalEscrowed);

      // Claim only item 1
      await monadFind.connect(finder).claimItem(1, proof);

      // Contract should still hold the second item's reward
      const contractBalanceAfter = await ethers.provider.getBalance(await monadFind.getAddress());
      expect(contractBalanceAfter).to.equal(smallReward);
    });
  });
});
