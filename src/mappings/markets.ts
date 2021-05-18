/* eslint-disable prefer-const */ // to satisfy AS compiler

// For each division by 10, add one to exponent to truncate one significant figure
import { Address } from '@graphprotocol/graph-ts'
import { Market } from '../types/schema'
import { Token } from '../types/templates/Token/Token'

export function createMarket(marketAddress: string): Market {
  let market: Market
  let contract = Token.bind(Address.fromString(marketAddress))
  market.name = contract.name()
  market.symbol = contract.symbol()

  market.accrualBlockNumber = 0
  market.blockTimestamp = 0

  return market
}

export function updateMarket(
  marketAddress: Address,
  blockNumber: i32,
  blockTimestamp: i32,
): Market {
  let marketID = marketAddress.toHexString()
  let market = Market.load(marketID)
  if (market == null) {
    market = createMarket(marketID)
  }

  // Only updateMarket if it has not been updated this block
  if (market.accrualBlockNumber != blockNumber) {
    let contractAddress = Address.fromString(market.id)
    let contract = Token.bind(contractAddress)

    market.accrualBlockNumber = contract.accrualBlockNumber().toI32()
    market.blockTimestamp = blockTimestamp
    market.save()
  }
  return market as Market
}
