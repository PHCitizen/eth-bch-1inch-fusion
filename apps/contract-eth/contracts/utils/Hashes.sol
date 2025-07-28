// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * @dev Library of standard hash functions.
 */
library Hashes {
    /**
     * @dev Commutative Sha256 hash of a sorted pair of bytes32. Frequently used when working with merkle proofs.
     *
     * NOTE: Equivalent to the `standardNodeHash` in our https://github.com/OpenZeppelin/merkle-tree[JavaScript library].
     */
    function commutativeSha256(bytes32 a, bytes32 b) internal pure returns (bytes32) {
        return a < b ? sha256(abi.encodePacked(a, b)) : sha256(abi.encodePacked(b, a));
    }
}
