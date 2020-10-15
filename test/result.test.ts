import { expect } from 'chai'

import { Res, Result } from '../src/facade'

function arrayGet<T>(arr: T[], idx: number): T {
    if (idx < 0 || !Number.isInteger(idx)) {
        throw new RangeError('idx must be a non-negative integer')
    }

    if (idx >= arr.length) {
        throw new RangeError('idx is out of bounds or arr')
    }

    return arr[idx]
}

describe('module "option"', () => {
    it('testing "tryCatch"', () => {
        const arr = [0, 1, 2, 3, 4]

        // catch error 1
        const res1 = Res.tryCatch(() => arrayGet(arr, 100), RangeError)
        expect(res1.isErr()).to.eq(true)
        if (res1.isErr()) {
            expect(res1.err.message).to.eq('idx is out of bounds or arr')
        } else {
            expect(true).to.eq(false)
        }

        // catch error 2
        const res2 = Res.tryCatch(() => arrayGet(arr, -1), RangeError)
        expect(res2.isErr()).to.eq(true)
        if (res2.isErr()) {
            expect(res2.err.message).to.eq('idx must be a non-negative integer')
        } else {
            expect(true).to.eq(false)
        }

        // error not caught, re-thrown
        const fn = () => Res.tryCatch(() => arrayGet(arr, -1), TypeError)
        expect(fn).throws(RangeError)

        // no error thrown
        const res3 = Res.tryCatch(() => arrayGet(arr, 2), Error)
        expect(res3).to.deep.eq(Res.Ok(2))
        expect(res3.isOk()).to.eq(true)

        // catch polymorphic error
        const res4 = Res.tryCatch(() => arrayGet(arr, 100), Error)
        expect(res4.isErr()).to.eq(true)
        if (res4.isErr()) {
            expect(res4.err instanceof RangeError).to.eq(true)
        }
    })
    it('testing "isOk", "isErr', () => {
        const ok = Res.Ok(10)
        expect(ok.isOk()).to.eq(true)
        expect(ok.isErr()).to.eq(false)
        if (ok.isOk()) {
            expect(ok.val).to.eq(10)
        }

        const err = Res.Err('error')
        expect(err.isOk()).to.eq(false)
        expect(err.isErr()).to.eq(true)
        if (err.isErr()) {
            expect(err.err).to.eq('error')
        }
    })
    it('testing "match"', () => {
        const res1 = Res.Ok(1)
        const res2 = Res.Err('error')

        expect(res1.match(n => n, _ => 100)).to.eq(1)
        expect(res2.match(n => n, _ => 100)).to.eq(100)
    })
})