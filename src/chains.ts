import { defineChain } from 'viem'
import type { RootstockChainId } from './types'

/**
 * Multicall3 contract address (standard deployment across chains)
 * https://www.multicall3.com/
 */
const MULTICALL3_ADDRESS = '0xcA11bde05977b3631167028862bE2a173976CA11' as const

/**
 * Rootstock Mainnet chain configuration
 */
export const rootstock = defineChain({
  id: 30,
  name: 'Rootstock Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Smart Bitcoin',
    symbol: 'RBTC',
  },
  rpcUrls: {
    default: {
      http: ['https://public-node.rsk.co'],
    },
  },
  blockExplorers: {
    default: {
      name: 'RSK Explorer',
      url: 'https://explorer.rsk.co',
    },
  },
  contracts: {
    multicall3: {
      address: MULTICALL3_ADDRESS,
    },
  },
})

/**
 * Rootstock Testnet chain configuration
 */
export const rootstockTestnet = defineChain({
  id: 31,
  name: 'Rootstock Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Test Smart Bitcoin',
    symbol: 'tRBTC',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.rootstock.io/bXcRliAz4Iw44SBOJ3xLR3QjOBUMe7-T'],
    },
  },
  blockExplorers: {
    default: {
      name: 'RSK Testnet Explorer',
      url: 'https://explorer.testnet.rsk.co',
    },
  },
  contracts: {
    multicall3: {
      address: MULTICALL3_ADDRESS,
    },
  },
  testnet: true,
})

/**
 * Get chain configuration by chain ID
 */
export function getChainById(chainId: RootstockChainId) {
  switch (chainId) {
    case 30:
      return rootstock
    case 31:
      return rootstockTestnet
    default:
      throw new Error(`Unsupported chain ID: ${chainId}. Use 30 (mainnet) or 31 (testnet).`)
  }
}

/**
 * Check if a chain ID is valid for Rootstock
 */
export function isValidChainId(chainId: number): chainId is RootstockChainId {
  return chainId === 30 || chainId === 31
}
