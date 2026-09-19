import { ethers } from 'ethers';

// ABI for the ResourceRegistry smart contract
const REGISTRY_ABI = [
  "function getResource(string memory _id) external view returns (tuple(string name, string url, uint8 status, uint256 verificationDate))"
];

// During the hackathon, we assume the local Hardhat node is running on port 8545
const RPC_URL = "http://127.0.0.1:8545";

// We will update this address dynamically after deployment
let CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Hardhat default first deploy address

export interface ResourceInfo {
  name: string;
  url: string;
  status: 'Unknown' | 'Verified' | 'Revoked';
  date: Date | null;
}

export function setContractAddress(address: string) {
  CONTRACT_ADDRESS = address;
}

/**
 * Fetches the verified status of a crisis resource from the local Ethereum node.
 * Falls back to realistic mock data if the node is not running.
 */
export async function getResourceStatus(id: string): Promise<ResourceInfo> {
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    // Timeout quickly to fallback to mock
    const network = await Promise.race([
      provider.getNetwork(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1000))
    ]);

    const contract = new ethers.Contract(CONTRACT_ADDRESS, REGISTRY_ABI, provider);

    // Call the getResource view function
    const result = await contract.getResource(id);

    // Enums are returned as numbers
    const statusCode = Number(result[2]);
    let statusStr: 'Unknown' | 'Verified' | 'Revoked' = 'Unknown';
    if (statusCode === 1) statusStr = 'Verified';
    if (statusCode === 2) statusStr = 'Revoked';

    return {
      name: result[0],
      url: result[1],
      status: statusStr,
      date: statusCode !== 0 ? new Date(Number(result[3]) * 1000) : null
    };
  } catch (err) {
    console.warn(`[Blockchain] Local node not found or failed, using mock data for ${id}`);
    
    // Mock fallback data
    const mockData: Record<string, ResourceInfo> = {
      '988-lifeline': {
        name: '988 Suicide & Crisis Lifeline',
        url: 'https://988lifeline.org',
        status: 'Verified',
        date: new Date('2024-01-15T00:00:00Z')
      },
      'samhsa-helpline': {
        name: 'SAMHSA National Helpline',
        url: 'https://www.samhsa.gov/find-help/national-helpline',
        status: 'Verified',
        date: new Date('2024-02-01T00:00:00Z')
      },
      'outdated-clinic': {
        name: 'Scam/Outdated Treatment Center',
        url: 'http://example-scam-rehab.com',
        status: 'Revoked',
        date: new Date('2023-11-10T00:00:00Z')
      }
    };

    return mockData[id] || { name: '', url: '', status: 'Unknown', date: null };
  }
}
