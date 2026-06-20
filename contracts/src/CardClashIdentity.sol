// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title CardClashIdentity
/// @notice Minimal on-chain identity for CardClash. A player's wallet address
///         IS their account id. This contract just lets them claim a human-
///         readable username and tracks wins, so there is a verifiable,
///         decentralized profile with no backend to deploy.
/// @dev    Deploy once to Sepolia. Gameplay stays off-chain (P2P); only
///         identity + results live here.
contract CardClashIdentity {
    struct Profile {
        string username;
        uint64 wins;
        uint64 losses;
        bool registered;
    }

    mapping(address => Profile) private profiles;
    mapping(bytes32 => address) public usernameOwner; // lowercased name hash -> owner

    event Registered(address indexed player, string username);
    event UsernameChanged(address indexed player, string oldName, string newName);
    event WinRecorded(address indexed winner, address indexed loser);

    error EmptyUsername();
    error UsernameTaken();
    error NotRegistered();

    /// @notice Claim or change your username. First call also registers you.
    function setUsername(string calldata name) external {
        if (bytes(name).length == 0 || bytes(name).length > 24) revert EmptyUsername();

        bytes32 key = _key(name);
        address current = usernameOwner[key];
        if (current != address(0) && current != msg.sender) revert UsernameTaken();

        Profile storage p = profiles[msg.sender];
        string memory old = p.username;

        // free up the old name
        if (bytes(old).length != 0) {
            delete usernameOwner[_key(old)];
        }

        p.username = name;
        usernameOwner[key] = msg.sender;

        if (!p.registered) {
            p.registered = true;
            emit Registered(msg.sender, name);
        } else {
            emit UsernameChanged(msg.sender, old, name);
        }
    }

    /// @notice Record a match result. Called by the winner after a game.
    /// @dev    For the hackathon this is permissionless/honor-system. The
    ///         vision doc's escrow/oracle resolver replaces this later.
    function recordWin(address loser) external {
        Profile storage w = profiles[msg.sender];
        if (!w.registered) revert NotRegistered();
        w.wins += 1;
        profiles[loser].losses += 1;
        emit WinRecorded(msg.sender, loser);
    }

    function getProfile(address player)
        external
        view
        returns (string memory username, uint64 wins, uint64 losses, bool registered)
    {
        Profile storage p = profiles[player];
        return (p.username, p.wins, p.losses, p.registered);
    }

    function isAvailable(string calldata name) external view returns (bool) {
        return usernameOwner[_key(name)] == address(0);
    }

    function _key(string memory name) private pure returns (bytes32) {
        return keccak256(bytes(_toLower(name)));
    }

    function _toLower(string memory s) private pure returns (string memory) {
        bytes memory b = bytes(s);
        for (uint256 i = 0; i < b.length; i++) {
            if (b[i] >= 0x41 && b[i] <= 0x5A) {
                b[i] = bytes1(uint8(b[i]) + 32);
            }
        }
        return string(b);
    }
}
