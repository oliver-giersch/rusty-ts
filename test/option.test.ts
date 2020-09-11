import { expect } from 'chai'

import { Option } from '../src/option'

describe('module "option"', () => {
    it('testing "None"', () => {
        const none: Option<string> = Option.None()
        expect(none.isSome()).to.eq(false)
        expect(none.isNone()).to.eq(true)
    })
    it('testing "Some"', () => {
        const some: Option<string> = Option.Some("string")
        expect(some.isSome()).to.eq(true)
        expect(some.isNone()).to.eq(false)
    })
})