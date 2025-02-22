import utils from '../../../../scoring/utils'
import { PasswordChanges } from '../matching/unmunger/getCleanPasswords'

export interface L33tOptions {
  l33t: string
  subs: PasswordChanges[]
  token: string
}

export interface GetCountsOptions {
  token: string
  sub: PasswordChanges
}

const getCounts = ({ sub, token }: GetCountsOptions) => {
  // lower-case match.token before calculating: capitalization shouldn't affect l33t calc.
  const chrs = token.toLowerCase().split('')
  // num of subbed chars
  const subbedCount = chrs.filter((char) => char === sub.substitution).length

  // num of unsubbed chars
  const unsubbedCount = chrs.filter((char) => char === sub.letter).length
  return {
    subbedCount,
    unsubbedCount,
  }
}

export default ({ l33t, subs, token }: L33tOptions) => {
  if (!l33t) {
    return 1
  }
  let variations = 1
  subs.forEach((sub) => {
    const { subbedCount, unsubbedCount } = getCounts({ sub, token })

    if (subbedCount === 0 || unsubbedCount === 0) {
      // for this sub, password is either fully subbed (444) or fully unsubbed (aaa)
      // treat that as doubling the space (attacker needs to try fully subbed chars in addition to
      // unsubbed.)
      variations *= 2
    } else {
      // this case is similar to capitalization:
      // with aa44a, U = 3, S = 2, attacker needs to try unsubbed + one sub + two subs
      const p = Math.min(unsubbedCount, subbedCount)
      let possibilities = 0
      for (let i = 1; i <= p; i += 1) {
        possibilities += utils.nCk(unsubbedCount + subbedCount, i)
      }
      variations *= possibilities
    }
  })
  return variations
}
