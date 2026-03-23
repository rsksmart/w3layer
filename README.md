[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/rsksmart/w3layer/badge)](https://scorecard.dev/viewer/?uri=github.com/rsksmart/w3layer)
[![CodeQL](https://github.com/rsksmart/w3layer/workflows/CodeQL/badge.svg)](https://github.com/rsksmart/w3layer/actions?query=workflow%3ACodeQL)

<img src="rootstock-logo.png" alt="RSK Logo" style="width:100%; height: auto;" />

# @rsksmart/w3layer

Web3 core layer for Rootstock SDKs. It wraps [viem](https://viem.sh) with a small, consistent API: public client, contract reads, multicall, write simulation, and signed transactions via a `WalletClient`.

Used internally by packages such as `@rsksmart/collective-sdk` and `@rsksmart/vaults-sdk`, or directly in apps that need a stable layer over Rootstock Mainnet (30) and Testnet (31).

## Installation

```bash
npm install @rsksmart/w3layer viem
```

## Quick start

```typescript
import { createW3Layer } from '@rsksmart/w3layer'
import { erc20Abi } from 'viem'

const w3 = createW3Layer({
  chainId: 31, // 30 = mainnet, 31 = testnet
  // rpcUrl: 'https://...', // optional; defaults to the chain’s public RPC
})

const balance = await w3.readContract<bigint>({
  address: '0x...',
  abi: erc20Abi,
  functionName: 'balanceOf',
  args: ['0x...'],
})

console.log('Balance:', balance)
```

## Features

- **Rootstock Mainnet / Testnet**: predefined chains (`rootstock`, `rootstockTestnet`) with Multicall3.
- **Reads**: `readContract` and `multicall` (batch reads with optional `allowFailure`).
- **Writes**: `writeContract` first simulates (with the wallet account) then broadcasts; returns `wait()` for receipts.
- **Helpers**: native `getBalance` (RBTC), `getLogs`, `getBlock`, and direct access to viem’s `publicClient`.

## API

### `createW3Layer(config)`

```typescript
import { createW3Layer, type RootstockChainId } from '@rsksmart/w3layer'

const w3 = createW3Layer({
  chainId: 31 as RootstockChainId,
  rpcUrl?: string, // optional
})
```

### `W3LayerInstance`

| Member | Description |
|--------|-------------|
| `chainId` | `30` or `31` |
| `publicClient` | viem `PublicClient` (advanced reads) |
| `readContract<T>(params)` | Call a view/pure function |
| `multicall(params)` | Batch multiple reads in one RPC round-trip |
| `simulateContract(params)` | Simulate a write (no signing) |
| `writeContract(walletClient, params)` | Simulate + send a signed transaction |
| `getBalance(address)` | Native RBTC/tRBTC balance (wei) |
| `getLogs(params)` | Contract event logs |
| `getBlock(blockNumber?)` | Block `timestamp` and `number` |

### `readContract`

```typescript
const value = await w3.readContract<bigint>({
  address: contractAddress,
  abi: MyAbi,
  functionName: 'balanceOf',
  args: [userAddress],
})
```

### `multicall`

```typescript
const results = await w3.multicall({
  contracts: [
    { address: tokenA, abi: erc20Abi, functionName: 'balanceOf', args: [addr] },
    { address: tokenB, abi: erc20Abi, functionName: 'balanceOf', args: [addr] },
  ],
  allowFailure: true,
})

for (const r of results) {
  if (r.status === 'success') {
    console.log(r.result)
  }
}
```

### `writeContract`

Requires a viem `WalletClient` with an `account` (e.g. private key or connector).

```typescript
import { createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { rootstockTestnet } from 'viem/chains'

const account = privateKeyToAccount('0x...')
const walletClient = createWalletClient({
  account,
  chain: rootstockTestnet,
  transport: http('https://...'), // use the same RPC as `w3` if you need consistency
})

const tx = await w3.writeContract(walletClient, {
  address: contractAddress,
  abi: MyAbi,
  functionName: 'approve',
  args: [spender, amount],
})

const receipt = await tx.wait(1)
console.log(receipt.status, receipt.blockNumber)
```

**Note:** Simulation passes the wallet account address as `msg.sender`, which is required for correct allowance and permission checks.

## Exported chains

```typescript
import {
  rootstock,
  rootstockTestnet,
  getChainById,
  isValidChainId,
} from '@rsksmart/w3layer'

const chain = getChainById(30)
```

- **`rootstock`**: chain id `30`
- **`rootstockTestnet`**: chain id `31`
- **`getChainById(chainId)`**: returns the chain definition for `30` or `31`
- **`isValidChainId(n)`**: type guard for `RootstockChainId`

### `getChainId(instance)`

Helper to read `chainId` from a `createW3Layer` instance:

```typescript
import { createW3Layer, getChainId } from '@rsksmart/w3layer'

const w3 = createW3Layer({ chainId: 31 })
getChainId(w3) // 31
```

## Supported networks

| Network | Chain ID |
|---------|------------|
| Rootstock Mainnet | 30 |
| Rootstock Testnet | 31 |

## TypeScript types

The package exports useful types alongside viem re-exports:

```typescript
import type {
  W3LayerConfig,
  W3LayerInstance,
  RootstockChainId,
  WriteContractResult,
  MulticallContractResult,
} from '@rsksmart/w3layer'
```

## Requirements

- Node.js >= 18
- TypeScript >= 5 (recommended peer dependency)

