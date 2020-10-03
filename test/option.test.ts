import { expect } from 'chai'

import { NoneError, Option } from '../src/internal'

describe('module "option"', () => {
    it('testing "None"', () => {
        const none: Option<string> = Option.None()
        expect(none.isSome()).to.eq(false)
        expect(none.isNone()).to.eq(true)
    })
    it('testing "Some"', () => {
        const some = Option.Some("string")
        expect(some.isSome()).to.eq(true)
        expect(some.isNone()).to.eq(false)
    })
    it('testing "from"', () => {
        expect(Option.from().isSome()).to.eq(false)
        expect(Option.from(undefined).isSome()).to.eq(false)
        expect(Option.from(null).isSome()).to.eq(false)
        expect(Option.from('string').isSome()).to.eq(true)
    })
    it('testing "unwrap"', () => {
        const none: Option<string> = Option.None()
        const some = Option.Some('string')
        expect(() => none.unwrap()).to.throw(new NoneError())
        expect(some.unwrap()).to.eq('string')
    })
    it('testing "unwrapOr"', () => {
        const none: Option<string> = Option.None()
        const some = Option.Some('string')
        expect(none.unwrapOr('else')).to.eq('else')
        expect(some.unwrapOr('else')).to.eq('string')
    })
    it('testing "iter"', () => {
        const option = Option.Some("string")
        const arr = []
        for (const string of option.iter()) {
            arr.push(string)
        }

        expect(arr).to.deep.eq(['string'])
    })
    it('testing "match"', () => {
        const option = Option.Some('string')
        const res = option.match(
            val => val,
            () => { throw new Error('unreachable') });

        expect(res).to.eq('string')
    })
})