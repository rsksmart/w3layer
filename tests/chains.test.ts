import { describe, it, expect } from 'vitest'
import { rootstock, rootstockTestnet, getChainById, isValidChainId } from '../src'

describe('rootstock (mainnet)', () => {
  it('should have correct chain id', () => {
    expect(rootstock.id).toBe(30)
  })

  it('should have correct name', () => {
    expect(rootstock.name).toBe('Rootstock Mainnet')
  })

  it('should have native currency as RBTC', () => {
    expect(rootstock.nativeCurrency.symbol).toBe('RBTC')
    expect(rootstock.nativeCurrency.decimals).toBe(18)
  })

  it('should have RPC URLs', () => {
    expect(rootstock.rpcUrls.default.http).toHaveLength(1)
  })

  it('should have block explorer', () => {
    expect(rootstock.blockExplorers?.default.url).toContain('rsk')
  })
})

describe('rootstockTestnet', () => {
  it('should have correct chain id', () => {
    expect(rootstockTestnet.id).toBe(31)
  })

  it('should have correct name', () => {
    expect(rootstockTestnet.name).toBe('Rootstock Testnet')
  })

  it('should have native currency as tRBTC', () => {
    expect(rootstockTestnet.nativeCurrency.symbol).toBe('tRBTC')
  })

  it('should be marked as testnet', () => {
    expect(rootstockTestnet.testnet).toBe(true)
  })
})

describe('getChainById', () => {
  it('should return mainnet for chainId 30', () => {
    const chain = getChainById(30)
    expect(chain.id).toBe(30)
  })

  it('should return testnet for chainId 31', () => {
    const chain = getChainById(31)
    expect(chain.id).toBe(31)
  })
})

describe('isValidChainId', () => {
  it('should return true for valid chain ids', () => {
    expect(isValidChainId(30)).toBe(true)
    expect(isValidChainId(31)).toBe(true)
  })

  it('should return false for invalid chain ids', () => {
    expect(isValidChainId(1)).toBe(false)
    expect(isValidChainId(0)).toBe(false)
    expect(isValidChainId(32)).toBe(false)
  })
})
