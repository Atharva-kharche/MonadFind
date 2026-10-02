// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title MonadFind
 * @author MONADFind Team
 * @notice A trust-minimized lost-and-found dApp on Monad where a lost-item
 *         reward is escrowed in a smart contract and released after
 *         cryptographic ownership proof is successfully verified.
 *
 * @dev PROOF DESIGN — How ownership verification works:
 *
 *   1. The item owner chooses a SECRET that only they know. This could be a
 *      serial number, a hidden marking, a passphrase written inside the item,
 *      or any unique piece of knowledge tied to the physical object.
 *
 *   2. The owner computes a HASH of that secret off-chain:
 *          proofHash = keccak256(abi.encodePacked(secret))
 *
 *   3. Only the proofHash is stored on-chain. The plaintext secret is NEVER
 *      stored on-chain. This prevents anyone from reading the blockchain
 *      to learn the secret and submit a fraudulent claim.
 *
 *   4. When a finder locates the item and discovers the secret (e.g., reads
 *      the serial number), they submit that secret as `proof` to claimItem().
 *
 *   5. The contract verifies:
 *          keccak256(abi.encodePacked(proof)) == storedProofHash
 *      If the hashes match, the finder has proven knowledge of the secret,
 *      and the escrowed reward is released to them.
 *
 *   IMPORTANT REAL-WORLD LIMITATION:
 *   A blockchain cannot physically verify ownership of a real-world object.
 *   This contract only verifies that the claimant possesses the correct
 *   secret (proof). The assumption is that only someone with physical access
 *   to the item would know this secret. The quality and security of this
 *   proof is entirely the responsibility of the item creator.
 */
contract MonadFind is ReentrancyGuard {

	// ============================================================
	//                          ENUMS
	// ============================================================

	/// @notice Possible statuses for a lost item
	enum Status {
		OPEN,     // Item is still lost; reward is escrowed and available
		RETURNED  // Item has been claimed; reward was paid out to the finder
	}

	// ============================================================
	//                         STRUCTS
	// ============================================================

	/// @notice Represents a single lost item listing
	struct Item {
		uint256 id;          // Unique item identifier (starts at 1)
		address creator;     // Address of the person who lost the item
		string title;        // Short title (e.g., "Blue Backpack")
		string description;  // Detailed description of the lost item
		string imageUri;     // URI to an image of the item (IPFS, HTTP, etc.)
		bytes32 proofHash;   // keccak256 hash of the ownership proof secret
		uint256 reward;      // Amount of MON escrowed as reward (in wei)
		address claimant;    // Address of the finder (zero until claimed)
		uint256 createdAt;   // Block timestamp when the item was created
		Status status;       // Current status of the item
	}

	// ============================================================
	//                     STATE VARIABLES
	// ============================================================

	/// @notice Total number of items ever created (also serves as ID counter)
	uint256 private _itemCount;

	/// @notice Mapping from item ID to its Item struct
	mapping(uint256 => Item) private _items;

	// ============================================================
	//                          EVENTS
	// ============================================================

	/// @notice Emitted when a new lost item is created with an escrowed reward
	event ItemCreated(
		uint256 indexed itemId,
		address indexed creator,
		uint256 reward
	);

	/// @notice Emitted when a lost item is successfully claimed and reward is released
	event ItemClaimed(
		uint256 indexed itemId,
		address indexed claimant,
		uint256 reward
	);

	// ============================================================
	//                     WRITE FUNCTIONS
	// ============================================================

	/**
	 * @notice Create a new lost item listing and escrow a MON reward.
	 * @param title       Short title for the lost item
	 * @param description Detailed description of the lost item
	 * @param imageUri    URI pointing to an image of the item
	 * @param proofHash   keccak256 hash of the ownership proof (computed off-chain)
	 *
	 * @dev The caller must send MON (msg.value > 0) with this transaction.
	 *      The sent MON is held in escrow inside the contract until a valid
	 *      claim is made. Item IDs start at 1 and increment sequentially.
	 */
	function createItem(
		string calldata title,
		string calldata description,
		string calldata imageUri,
		bytes32 proofHash
	) external payable {
		// --- Checks ---
		require(msg.value > 0, "Reward must be greater than zero");
		require(bytes(title).length > 0, "Title cannot be empty");
		require(proofHash != bytes32(0), "Proof hash cannot be zero");

		// --- Effects ---
		_itemCount += 1;
		uint256 newItemId = _itemCount;

		_items[newItemId] = Item({
			id: newItemId,
			creator: msg.sender,
			title: title,
			description: description,
			imageUri: imageUri,
			proofHash: proofHash,
			reward: msg.value,
			claimant: address(0),
			createdAt: block.timestamp,
			status: Status.OPEN
		});

		// No Interactions needed — the MON is already inside the contract
		// because this function is `payable` and msg.value was sent with it.

		emit ItemCreated(newItemId, msg.sender, msg.value);
	}

	/**
	 * @notice Claim a lost item by providing the correct ownership proof.
	 *         If the proof is valid, the escrowed reward is released to the caller.
	 * @param itemId The ID of the item to claim
	 * @param proof  The plaintext ownership proof (the secret)
	 *
	 * @dev Security pattern: Checks-Effects-Interactions (CEI)
	 *      1. CHECKS  — Validate item existence, status, reward, and proof
	 *      2. EFFECTS — Update state (status, claimant) BEFORE sending funds
	 *      3. INTERACTIONS — Transfer the reward AFTER all state changes
	 *
	 *      OpenZeppelin's ReentrancyGuard is used as an additional safety layer
	 *      to prevent reentrancy attacks on the ETH transfer.
	 */
	function claimItem(
		uint256 itemId,
		bytes32 proof
	) external nonReentrant {
		// --- Checks ---
		require(itemId > 0 && itemId <= _itemCount, "Item does not exist");

		Item storage item = _items[itemId];

		require(item.status == Status.OPEN, "Item is not open for claims");
		require(item.reward > 0, "No reward available");
		require(
			keccak256(abi.encodePacked(proof)) == item.proofHash,
			"Invalid ownership proof"
		);

		// --- Effects (update state BEFORE sending funds) ---
		uint256 rewardAmount = item.reward;
		item.status = Status.RETURNED;
		item.claimant = msg.sender;

		// --- Interactions (external call AFTER all state changes) ---
		(bool success, ) = payable(msg.sender).call{ value: rewardAmount }("");
		require(success, "Reward transfer failed");

		emit ItemClaimed(itemId, msg.sender, rewardAmount);
	}

	// ============================================================
	//                      READ FUNCTIONS
	// ============================================================

	/**
	 * @notice Get the full details of a specific item.
	 * @param itemId The ID of the item to retrieve
	 * @return The complete Item struct for the given ID
	 */
	function getItem(uint256 itemId) external view returns (Item memory) {
		require(itemId > 0 && itemId <= _itemCount, "Item does not exist");
		return _items[itemId];
	}

	/**
	 * @notice Get the total number of items ever created.
	 * @return The total item count (also the highest valid item ID)
	 */
	function getItemCount() external view returns (uint256) {
		return _itemCount;
	}
}
