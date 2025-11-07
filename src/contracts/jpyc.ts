import { getAddress } from 'viem';

// JPYC Contract Configuration
export const JPYC_CONFIG = {
  // 公式JPYC Faucet (Sepolia testnet)
  address: getAddress('0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB'),
  abi: [
    // ERC20 Standard Functions
    {
      inputs: [{ name: 'account', type: 'address' }],
      name: 'balanceOf',
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'decimals',
      outputs: [{ name: '', type: 'uint8' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'symbol',
      outputs: [{ name: '', type: 'string' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'name',
      outputs: [{ name: '', type: 'string' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'totalSupply',
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        { name: 'to', type: 'address' },
        { name: 'amount', type: 'uint256' }
      ],
      name: 'transfer',
      outputs: [{ name: '', type: 'bool' }],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        { name: 'owner', type: 'address' },
        { name: 'spender', type: 'address' }
      ],
      name: 'allowance',
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        { name: 'spender', type: 'address' },
        { name: 'amount', type: 'uint256' }
      ],
      name: 'approve',
      outputs: [{ name: '', type: 'bool' }],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ] as const,
} as const;

// Utility function to format JPYC balance (1JPYC = 1円スタイル)
export function formatJPYCBalance(balance: bigint, decimals: number = 18): string {
  const divisor = BigInt(10 ** decimals);
  const wholePart = balance / divisor;
  
  // JPYCは整数で表示（円と同様）
  return wholePart.toString();
}

// Format balance for display (日本円スタイル)
export function formatJPYCDisplay(balance: bigint, decimals: number = 18): string {
  const wholePart = balance / BigInt(10 ** decimals);
  const number = Number(wholePart);
  
  // 日本円と同様に3桁区切りで表示
  return number.toLocaleString('ja-JP');
}

// コミュニティJPYC契約設定
export const JPYC_COMMUNITY_CONFIG = {
  // コミュニティJPYCコントラクト (jpyc.cool)
  address: getAddress('0xd3eF95d29A198868241FE374A999fc25F6152253'),
  abi: JPYC_CONFIG.abi,
} as const;