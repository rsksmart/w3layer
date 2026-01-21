/**
 * @rsksmart/w3layer
 *
 * Web3 Core Layer for Rootstock SDK
 * Provides high-level abstractions for blockchain interactions
 */

export { createW3Layer, getChainId } from './client'

export { rootstock, rootstockTestnet, getChainById, isValidChainId } from './chains'

export type {
  W3LayerConfig,
  W3LayerInstance,
  RootstockChainId,
  ReadContractParams,
  WriteContractParams,
  ReadContractResult,
  WriteContractResult,
  SimulateResult,
  TransactionReceipt,
  MulticallParams,
  MulticallContractResult,
} from './types'

export type { Address, Hash, Abi, PublicClient, WalletClient } from 'viem'
