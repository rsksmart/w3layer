import type { Abi, Address, Hash, PublicClient, WalletClient } from 'viem'

/**
 * Supported chain IDs for Rootstock network
 */
export type RootstockChainId = 30 | 31

/**
 * Configuration options for initializing the W3Layer
 */
export interface W3LayerConfig {
  /** Chain ID: 30 for mainnet, 31 for testnet */
  chainId: RootstockChainId
  /** Custom RPC URL (optional, uses default public nodes if not provided) */
  rpcUrl?: string
}

/**
 * Result of a contract read operation
 */
export interface ReadContractResult<T> {
  data: T
}

/**
 * Parameters for reading from a contract
 */
export interface ReadContractParams<TAbi extends Abi = Abi> {
  /** Contract address */
  address: Address
  /** Contract ABI */
  abi: TAbi
  /** Function name to call */
  functionName: string
  /** Function arguments */
  args?: readonly unknown[]
}

/**
 * Parameters for writing to a contract
 */
export interface WriteContractParams<TAbi extends Abi = Abi> {
  /** Contract address */
  address: Address
  /** Contract ABI */
  abi: TAbi
  /** Function name to call */
  functionName: string
  /** Function arguments */
  args?: readonly unknown[]
  /** Value to send with transaction (in wei) */
  value?: bigint
}

/**
 * Result of a simulated transaction
 */
export interface SimulateResult {
  /** Whether simulation was successful */
  success: boolean
  /** Simulated result data */
  result?: unknown
  /** Error message if simulation failed */
  error?: string
}

/**
 * Result of a write transaction
 */
export interface WriteContractResult {
  /** Transaction hash */
  hash: Hash
  /** Wait for transaction confirmation */
  wait: (confirmations?: number) => Promise<TransactionReceipt>
}

/**
 * Transaction receipt
 */
export interface TransactionReceipt {
  /** Transaction hash */
  transactionHash: Hash
  /** Block number */
  blockNumber: bigint
  /** Transaction status: 'success' or 'reverted' */
  status: 'success' | 'reverted'
  /** Gas used */
  gasUsed: bigint
}

/**
 * Parameters for multicall
 */
export interface MulticallParams {
  /** Array of contract calls */
  contracts: ReadContractParams[]
  /** Allow failures in individual calls */
  allowFailure?: boolean
}

/**
 * Result of a single multicall contract
 */
export interface MulticallContractResult<T = unknown> {
  status: 'success' | 'failure'
  result?: T
  error?: Error
}

/**
 * W3Layer instance interface
 */
export interface W3LayerInstance {
  /** Chain ID */
  chainId: RootstockChainId
  /** Public client for read operations */
  publicClient: PublicClient
  /** Read from a contract */
  readContract: <T>(params: ReadContractParams) => Promise<T>
  /** Execute multiple read calls in a single request */
  multicall: <T extends readonly unknown[]>(
    params: MulticallParams
  ) => Promise<MulticallContractResult<T[number]>[]>
  /** Simulate a write transaction */
  simulateContract: (params: WriteContractParams) => Promise<SimulateResult>
  /** Write to a contract (requires wallet client) */
  writeContract: (
    walletClient: WalletClient,
    params: WriteContractParams
  ) => Promise<WriteContractResult>
  /** Get native token balance (RBTC) for an address */
  getBalance: (address: `0x${string}`) => Promise<bigint>
}
