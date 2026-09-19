// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ResourceRegistry
 * @dev A smart contract to register and verify crisis helplines and resources.
 * Only the contract owner can add or revoke resources, providing a cryptographically
 * verifiable source of truth for the Anchor frontend.
 */
contract ResourceRegistry {
    address public owner;

    enum Status { Unknown, Verified, Revoked }

    struct Resource {
        string name;
        string url;
        Status status;
        uint256 verificationDate;
    }

    // Mapping from a resource ID (e.g., "988-lifeline") to its details
    mapping(string => Resource) public resources;

    event ResourceVerified(string indexed id, string name, string url);
    event ResourceRevoked(string indexed id);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Verify a new or existing resource.
     * @param _id A unique string identifier for the resource.
     * @param _name Human-readable name.
     * @param _url URL or contact info for the resource.
     */
    function verifyResource(string memory _id, string memory _name, string memory _url) external onlyOwner {
        resources[_id] = Resource({
            name: _name,
            url: _url,
            status: Status.Verified,
            verificationDate: block.timestamp
        });
        emit ResourceVerified(_id, _name, _url);
    }

    /**
     * @dev Revoke a previously verified resource.
     * @param _id The unique string identifier.
     */
    function revokeResource(string memory _id) external onlyOwner {
        require(resources[_id].status != Status.Unknown, "Resource does not exist");
        resources[_id].status = Status.Revoked;
        emit ResourceRevoked(_id);
    }

    /**
     * @dev Get the status of a resource.
     * @param _id The unique string identifier.
     */
    function getResource(string memory _id) external view returns (Resource memory) {
        return resources[_id];
    }
}
