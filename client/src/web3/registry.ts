// CardClashIdentity contract — deployed on Ethereum Sepolia.
// After deploying (see contracts/README.md), paste the address into
// VITE_IDENTITY_ADDRESS in client/.env, or replace the fallback below.

export const IDENTITY_ADDRESS = (import.meta.env.VITE_IDENTITY_ADDRESS ??
  '0x0000000000000000000000000000000000000000') as `0x${string}`;

export const identityAbi = [
  {
    type: 'function',
    name: 'getProfile',
    stateMutability: 'view',
    inputs: [{ name: 'player', type: 'address' }],
    outputs: [
      { name: 'username', type: 'string' },
      { name: 'wins', type: 'uint64' },
      { name: 'losses', type: 'uint64' },
      { name: 'registered', type: 'bool' },
    ],
  },
  {
    type: 'function',
    name: 'isAvailable',
    stateMutability: 'view',
    inputs: [{ name: 'name', type: 'string' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    type: 'function',
    name: 'setUsername',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'name', type: 'string' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'recordWin',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'loser', type: 'address' }],
    outputs: [],
  },
] as const;

export const isContractConfigured =
  IDENTITY_ADDRESS !== '0x0000000000000000000000000000000000000000';
