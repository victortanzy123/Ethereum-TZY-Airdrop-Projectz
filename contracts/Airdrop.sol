// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Airdrop {
    // Need Admin (Owner of token ) to approve the receipient via a backend on Next.js
    address public admin;
    IERC20 public token;
    uint256 public currentAirdroppedAmount;
    uint256 public maxAirdropAmount = 100000 * 10**18;
    uint256 public deadline;

    // Mappings:
    mapping(address => bool) public airDroppedIndex;

    // Modifiers

    modifier onlyAdmin() {
        require(msg.sender == admin, "not admin");
        _;
    }

    modifier validateDeadline() {
        require(block.timestamp < deadline, "Airdrop contract expired");
        _;
    }

    // Events:
    event AirdropTransaction(address receipient, uint256 amount, uint256 date);

    constructor(
        address _admin,
        address _tokenToAirdrop,
        uint256 _deadlineDuration
    ) {
        admin = _admin;
        token = IERC20(_tokenToAirdrop);
        deadline = block.timestamp + _deadlineDuration;
    }

    // Admin Function:
    function updateAdmin(address _newAdmin) external onlyAdmin {
        admin = _newAdmin;
    }

    function claimAirdropTokens(
        address _receipient,
        uint256 _amount,
        bytes calldata _signature
    ) external validateDeadline {
        // pre-fixing an encoded message from the receipient with the amount:
        bytes32 message = prefixHash(
            keccak256(abi.encodePacked(_receipient, _amount))
        );

        // Check if the Signer of the message belongs to the admin:
        require(
            recoverSignerAddress(message, _signature) == admin,
            "wrong signature"
        );

        // Check if the receipient has ALREADY RECEIVED: (cannot receive twice)
        require(
            airDroppedIndex[_receipient] == false,
            "received Airdrop already"
        );

        require(
            currentAirdroppedAmount + _amount <= maxAirdropAmount,
            "insufficient tokens"
        );
        // Once all checks pass, set state first before transacting:
        airDroppedIndex[_receipient] = true;
        currentAirdroppedAmount += _amount;

        // Complete transaction:
        token.transfer(_receipient, _amount);

        emit AirdropTransaction(_receipient, _amount, block.timestamp);
    }

    // Hashing & Decoding Functions:

    // Pre-fixing the encoded message:
    // @dev: function set to 'internal' to limit inheritance from within the contract function:
    // Recreates message signed on the client
    function prefixHash(bytes32 _hash) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encodePacked("\x19Ethereum Signed Message:\n32", _hash)
            );
    }

    // @dev: Function to retrieve ADDRESS of signer:
    // requires v ,r, s of the account RETRIEVED from signature:
    function recoverSignerAddress(bytes32 _message, bytes memory _signature)
        internal
        pure
        returns (address)
    {
        // Instantiating the v ,r, s variables:
        uint8 v;
        bytes32 r;
        bytes32 s;

        // Retrieiving from signature
        (v, r, s) = splitSignature(_signature);

        // Returns an address from the message tallied with the signature.
        return ecrecover(_message, v, r, s);
    }

    // @dev: splitSignature to retrieve individual v (uint 8), r (bytes32) & s (bytes32):
    function splitSignature(bytes memory _signature)
        internal
        pure
        returns (
            uint8,
            bytes32,
            bytes32
        )
    {
        // Check if signature is of valid length first:
        require(_signature.length == 65, "invalid signature");

        // Instantiating variables:
        uint8 v;
        bytes32 r;
        bytes32 s;

        // Using assembly to Decode:
        // Sequence of order for individual hashed components:
        // r (first 32 bytes) -> s (second 32 bytes) -> v (final bytes AKA first bytes of the next 32 bytes - unit8)
        assembly {
            r := mload(add(_signature, 32))
            s := mload(add(_signature, 64))
            v := byte(0, mload(add(_signature, 96)))
        }

        return (v, r, s);
    }

    // Helper Functions:

    function getAmountLeftToAirdrop() public view returns (uint256) {
        return maxAirdropAmount - currentAirdroppedAmount;
    }
}
