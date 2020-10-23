import { expect } from 'chai'

import { NoneError, Option } from '../src/lib'

describe('module "option"', () => {
    it('testing "from nullable Some"', () => {
        const none: Option<string> = Option.from(null)
        expect(none.isNone()).to.eq(true)
    })
    it('testing "None"', () => {
        const none: Option<string> = Option.None
        expect(none.isSome()).to.eq(false)
        expect(none.isNone()).to.eq(true)
    })
    it('testing "Some"', () => {
        const some = Option.Some("string")
        expect(some.isSome()).to.eq(true)
        expect(some.isNone()).to.eq(false)
    })
    it('testing "from"', () => {
        const undef: Option<string> = Option.from(undefined)
        expect(undef.isNone()).to.eq(true)
        const nil: Option<string> = Option.from(null)
        expect(nil.isNone()).to.eq(true)
        const str: Option<string> = Option.from('some')
        expect(str.isSome()).to.eq(true)
        const bad: Option<null> = Option.from(null)
        expect(bad.isNone()).to.eq(true)
    })
    it('testing "unwrap"', () => {
        const none: Option<string> = Option.None
        const some = Option.Some('string')
        expect(() => none.unwrap()).to.throw(NoneError)
        expect(some.unwrap()).to.eq('string')
    })
    it('testing "unwrapOr"', () => {
        const none: Option<string> = Option.None
        const some = Option.Some('string')
        expect(none.unwrapOr('else')).to.eq('else')
        expect(some.unwrapOr('else')).to.eq('string')
    })
    /*it('testing "iter"', () => {
        const option = Opt.Some("string")
        const arr = []
        for (const string of option.iter()) {
            arr.push(string)
        }

        expect(arr).to.deep.eq(['string'])
    })*/
    it('testing "match"', () => {
        const option = Option.Some('string')
        const res = option.match(
            val => val,
            () => { throw new Error('unreachable') });

        expect(res).to.eq('string')
    })
})