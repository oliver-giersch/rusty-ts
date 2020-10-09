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
        const res1 = Res.tryCatch(() => arrayGet(arr, 100), RangeError)
        expect(res1.isErr()).to.eq(true)
        if (res1.isErr()) {
            expect(res1.err.message).to.eq('idx is out of bounds or arr')
        } else {
            expect(true).to.eq(false)
        }

        const res2 = Res.tryCatch(() => arrayGet(arr, -1), RangeError)
        expect(res2.isErr()).to.eq(true)
        if (res2.isErr()) {
            expect(res2.err.message).to.eq('idx must be a non-negative integer')
        } else {
            expect(true).to.eq(false)
        }

        const fn = () => Res.tryCatch(() => arrayGet(arr, -1), TypeError)
        expect(fn).throws(RangeError)
    })
})