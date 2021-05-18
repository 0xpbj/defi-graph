/* eslint-disable prefer-const */ // to satisfy AS compiler

// For each division by 10, add one to exponent to truncate one significant figure
import { BigDecimal, BigInt, Bytes } from '@graphprotocol/graph-ts'
import { AccountToken, Account, AccountTokenTransaction } from '../types/schema'

export function exponentToBigDecimal(decimals: i32): BigDecimal {
  let bd = BigDecimal.fromString('1')
  for (let i = 0; i < decimals; i++) {
    bd = bd.times(BigDecimal.fromString('10'))
  }
  return bd
}

export let mantissaFactor = 18
export let TokenDecimals = 8
export let mantissaFactorBD: BigDecimal = exponentToBigDecimal(18)
export let TokenDecimalsBD: BigDecimal = exponentToBigDecimal(8)
export let zeroBD = BigDecimal.fromString('0')

export function createAccountToken(
  TokenStatsID: string,
  symbol: string,
  account: string,
  marketID: string,
): AccountToken {
  let TokenStats = new AccountToken(TokenStatsID)
  TokenStats.symbol = symbol
  TokenStats.market = marketID
  TokenStats.account = account
  TokenStats.accrualBlockNumber = BigInt.fromI32(0)
  TokenStats.TokenBalance = zeroBD
  return TokenStats
}

export function createAccount(accountID: string): Account {
  let account = new Account(accountID)
  account.save()
  return account
}

export function updateCommonTokenStats(
  marketID: string,
  marketSymbol: string,
  accountID: string,
  tx_hash: Bytes,
  timestamp: BigInt,
  blockNumber: BigInt,
  logIndex: BigInt,
): AccountToken {
  let TokenStatsID = marketID.concat('-').concat(accountID)
  let TokenStats = AccountToken.load(TokenStatsID)
  if (TokenStats == null) {
    TokenStats = createAccountToken(TokenStatsID, marketSymbol, accountID, marketID)
  }
  getOrCreateAccountTokenTransaction(
    TokenStatsID,
    tx_hash,
    timestamp,
    blockNumber,
    logIndex,
  )
  TokenStats.accrualBlockNumber = blockNumber
  return TokenStats as AccountToken
}

export function getOrCreateAccountTokenTransaction(
  accountID: string,
  tx_hash: Bytes,
  timestamp: BigInt,
  block: BigInt,
  logIndex: BigInt,
): AccountTokenTransaction {
  let id = accountID
    .concat('-')
    .concat(tx_hash.toHexString())
    .concat('-')
    .concat(logIndex.toString())
  let transaction = AccountTokenTransaction.load(id)

  if (transaction == null) {
    transaction = new AccountTokenTransaction(id)
    transaction.account = accountID
    transaction.tx_hash = tx_hash
    transaction.timestamp = timestamp
    transaction.block = block
    transaction.logIndex = logIndex
    transaction.save()
  }

  return transaction as AccountTokenTransaction
}
