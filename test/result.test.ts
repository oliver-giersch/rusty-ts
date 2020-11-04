import { expect } from 'chai'

import { Result, UnwrapError } from '../src/lib'

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
        const res1 = Result.tryCatch(() => arrayGet(arr, 100), RangeError)
        expect(res1.isErr()).to.eq(true)
        if (res1.isErr()) {
            expect(res1.err.message).to.eq('idx is out of bounds or arr')
        } else {
            expect(true).to.eq(false)
        }

        // catch error 2
        const res2 = Result.tryCatch(() => arrayGet(arr, -1), RangeError)
        expect(res2.isErr()).to.eq(true)
        if (res2.isErr()) {
            expect(res2.err.message).to.eq('idx must be a non-negative integer')
        } else {
            expect(true).to.eq(false)
        }

        // error not caught, re-thrown
        const fn = () => Result.tryCatch(() => arrayGet(arr, -1), TypeError)
        expect(fn).throws(RangeError)

        // no error thrown
        const res3 = Result.tryCatch(() => arrayGet(arr, 2), Error)
        expect(res3).to.deep.eq(Result.Ok(2))
        expect(res3.isOk()).to.eq(true)

        // catch polymorphic error
        const res4 = Result.tryCatch(() => arrayGet(arr, 100), Error)
        expect(res4.isErr()).to.eq(true)
        if (res4.isErr()) {
            expect(res4.err instanceof RangeError).to.eq(true)
        }
    })
    it('testing "isOk"', () => {
        expect(Result.Ok(100).isOk()).to.eq(true)
        expect(Result.Err('o').isOk()).to.eq(false)

        // ensure that narrowing works as expected
        const ok = Result.Ok(22)
        expect(ok.isOk()).to.eq(true)
        if (ok.isOk()) {
            expect(ok.val).to.eq(22)
        }
    })
    it('testing "isErr"', () => {
        expect(Result.Ok(100).isErr()).to.eq(false)
        expect(Result.Err('o').isErr()).to.eq(true)

        // ensure that narrowing works as expected
        const err = Result.Err('error')
        expect(err.isErr()).to.eq(true)
        if (err.isErr()) {
            expect(err.err).to.eq('error')
        }

    })
    it('testing "match"', () => {
        expect(Result.Ok(1).match(n => n, _ => 100)).to.eq(1)
        expect(Result.Err('error').match(n => n, _ => 100)).to.eq(100)
    })
    it('testing "map"', () => {
        expect(Result.Ok(1).map(n => n * 2)).to.deep.eq(Result.Ok(2))
        const err: Result<number, string> = Result.Err('bad')
        expect(err.map((n: number) => n * 2)).to.deep.eq(Result.Err('bad'))
    })
    it('testing "mapOr"', () => {
        expect(Result.Ok(2).mapOr(100, n => n * 40)).to.eq(80)
        const err: Result<number, string> = Result.Err('bad')
        expect(err.mapOr(100, (n: number) => n * 40)).to.eq(100)
    })
    it('testing "and"', () => {
        expect(Result.Ok(20).and(Result.Ok('success'))).to.deep.eq(Result.Ok('success'))
        expect(Result.Ok(20).and(Result.Err('failure'))).to.deep.eq(Result.Err('failure'))
        expect(Result.Err('bad').and(Result.Ok(50))).to.deep.eq(Result.Err('bad'))
        expect(Result.Err('bad').and(Result.Err('error'))).to.deep.eq(Result.Err('bad'))
    })
    it('testing "andThen"', () => {
        const lessThanTen: (n: number) => Result<string, number> =
            n => n < 10 ? Result.Ok('less than 10') : Result.Err(n)
        expect(Result.Ok(10).andThen(lessThanTen)).to.deep.eq(Result.Err(10))
        expect(Result.Ok(5).andThen(lessThanTen)).to.deep.eq(Result.Ok('less than 10'))
        const err: Result<number, number> = Result.Err(Number.NaN)
        expect(err.andThen(lessThanTen)).to.deep.eq(Result.Err(Number.NaN))
    })
    it('testing "unwrap"', () => {
        expect(Result.Ok(10).unwrap()).to.deep.eq(10)
        expect(() => Result.Err('bad').unwrap()).to.throw(UnwrapError)
    })
    it('testing "unwrapOr"', () => {
        expect(Result.Ok(10).unwrapOr(100)).to.eq(10)
        expect(Result.Err('err').unwrapOr(100)).to.eq(100)
    })
    it('testing "unwrapOrElse"', () => {
        expect(Result.Ok(10).unwrapOrElse(() => 100)).to.eq(10)
        expect(Result.Err('err').unwrapOrElse(() => 100)).to.eq(100)
    })
})