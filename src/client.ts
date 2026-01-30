import {
  createPublicClient,
  http,
  type PublicClient,
  type WalletClient,
} from 'viem'
import { getChainById } from './chains'
import type {
  W3LayerConfig,
  W3LayerInstance,
  ReadContractParams,
  WriteContractParams,
  MulticallParams,
  MulticallContractResult,
  SimulateResult,
  WriteContractResult,
  RootstockChainId,
} from './types'

/**
 * Creates a W3Layer instance for interacting with Rootstock blockchain
 *
 * @param config - Configuration options
 * @returns W3Layer instance with read/write methods
 *
 * @example
 * ```ts
 * const w3 = createW3Layer({ chainId: 30 })
 *
 * // Read from contract
 * const balance = await w3.readContract({
 *   address: '0x...',
 *   abi: erc20Abi,
 *   functionName: 'balanceOf',
 *   args: ['0x...']
 * })
 * ```
 */
export function createW3Layer(config: W3LayerConfig): W3LayerInstance {
  const chain = getChainById(config.chainId)

  const publicClient = createPublicClient({
    chain,
    transport: http(config.rpcUrl),
  })

  return {
    chainId: config.chainId,
    publicClient,
    readContract: (params) => readContract(publicClient, params),
    multicall: (params) => multicall(publicClient, params),
    simulateContract: (params) => simulateContract(publicClient, params),
    writeContract: (walletClient, params) =>
      writeContract(publicClient, walletClient, params),
    getBalance: (address) => getBalance(publicClient, address),
    getLogs: (params) => getLogs(publicClient, params),
    getBlock: (blockNumber) => getBlock(publicClient, blockNumber),
  }
}

/**
 * Read data from a smart contract
 */
async function readContract<T>(
  client: PublicClient,
  params: ReadContractParams
): Promise<T> {
  const result = await client.readContract({
    address: params.address,
    abi: params.abi,
    functionName: params.functionName,
    args: params.args as unknown[],
  })

  return result as T
}

/**
 * Execute multiple contract reads in a single RPC call
 */
async function multicall<T extends readonly unknown[]>(
  client: PublicClient,
  params: MulticallParams
): Promise<MulticallContractResult<T[number]>[]> {
  const contracts = params.contracts.map((contract) => ({
    address: contract.address,
    abi: contract.abi,
    functionName: contract.functionName,
    args: contract.args as unknown[],
  }))

  const results = await client.multicall({
    contracts,
    allowFailure: params.allowFailure ?? true,
  })

  const mapped: MulticallContractResult<T[number]>[] = []

  for (const r of results) {
    const item = r as { status: 'success' | 'failure'; result?: unknown; error?: Error }
    if (item.status === 'success') {
      mapped.push({
        status: 'success',
        result: item.result as T[number],
      })
    } else {
      mapped.push({
        status: 'failure',
        error: item.error,
      })
    }
  }

  return mapped
}

/**
 * Simulate a contract write transaction
 */
async function simulateContract(
  client: PublicClient,
  params: WriteContractParams
): Promise<SimulateResult> {
  try {
    const { result } = await client.simulateContract({
      address: params.address,
      abi: params.abi,
      functionName: params.functionName,
      args: params.args as unknown[],
      value: params.value,
    })

    return {
      success: true,
      result,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Simulation failed',
    }
  }
}

/**
 * Write to a smart contract (execute a transaction)
 */
async function writeContract(
  publicClient: PublicClient,
  walletClient: WalletClient,
  params: WriteContractParams
): Promise<WriteContractResult> {
  const simulation = await simulateContract(publicClient, params)
  if (!simulation.success) {
    throw new Error(`Transaction simulation failed: ${simulation.error}`)
  }

  const [account] = await walletClient.getAddresses()
  if (!account) {
    throw new Error('No account available in wallet client')
  }

  const hash = await walletClient.writeContract({
    address: params.address,
    abi: params.abi,
    functionName: params.functionName,
    args: params.args as unknown[],
    value: params.value,
    account,
    chain: publicClient.chain,
  })

  return {
    hash,
    wait: async (confirmations = 1) => {
      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
        confirmations,
      })

      return {
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        status: receipt.status,
        gasUsed: receipt.gasUsed,
      }
    },
  }
}

/**
 * Get native token balance (RBTC) for an address
 */
async function getBalance(
  client: PublicClient,
  address: `0x${string}`
): Promise<bigint> {
  return client.getBalance({ address })
}

/**
 * Get contract event logs
 */
async function getLogs(
  client: PublicClient,
  params: {
    address: `0x${string}`
    event: unknown
    args?: Record<string, unknown>
    fromBlock?: bigint
    toBlock?: bigint | 'latest'
  }
): Promise<unknown[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const logs = await client.getLogs({
    address: params.address,
    event: params.event,
    args: params.args,
    fromBlock: params.fromBlock,
    toBlock: params.toBlock,
  } as any)
  return logs
}

/**
 * Get block information
 */
async function getBlock(
  client: PublicClient,
  blockNumber?: bigint
): Promise<{ timestamp: bigint; number: bigint }> {
  const block = await client.getBlock({
    blockNumber,
  })
  return {
    timestamp: block.timestamp,
    number: block.number,
  }
}

/**
 * Type helper to get the chain ID from a W3Layer instance
 */
export function getChainId(instance: W3LayerInstance): RootstockChainId {
  return instance.chainId
}
