import { getAddress } from 'viem';

// JPYC Contract Configuration
export const JPYC_CONFIG = {
  // Sepolia testnet JPYC contract address (from community faucet) - 正確なアドレス
  address: getAddress('0xd3eF95d29A198868241FE374A999fc25F6152253'),
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

// Utility function to format JPYC balance
export function formatJPYCBalance(balance: bigint, decimals: number = 18): string {
  const divisor = BigInt(10 ** decimals);
  const wholePart = balance / divisor;
  const fractionalPart = balance % divisor;
  
  if (fractionalPart === BigInt(0)) {
    return wholePart.toString();
  }
  
  const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
  const trimmedFractional = fractionalStr.replace(/0+$/, '');
  
  if (trimmedFractional === '') {
    return wholePart.toString();
  }
  
  return `${wholePart}.${trimmedFractional}`;
}

// Format balance for display
export function formatJPYCDisplay(balance: bigint, decimals: number = 18): string {
  const formatted = formatJPYCBalance(balance, decimals);
  const number = parseFloat(formatted);
  
  if (number >= 1000000) {
    return `${(number / 1000000).toFixed(2)}M`;
  } else if (number >= 1000) {
    return `${(number / 1000).toFixed(2)}K`;
  } else if (number >= 1) {
    return number.toFixed(2);
  } else {
    return number.toFixed(4);
  }
}

// 代替JPYC契約設定（Faucetで見つかったアドレス用）
export const JPYC_FAUCET_CONFIG = {
  // Faucetで実際に使用されているJPYCコントラクト
  address: '0xBba72DE9359a1949845843f106ecd1296e020e8' as `0x${string}`,
  abi: JPYC_CONFIG.abi,
} as const;