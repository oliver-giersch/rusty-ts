/*import { expect } from 'chai'

import { adapt, Iter } from '../src/facade'
import { Option, Opt } from '../src/facade'

function buildIter(): Iter<number> {
    return adapt([0, 1, 2, 3, 4, 5].values())
}

describe('testing "iter" module', () => {
    it('testing "next"', () => {
        const iter = buildIter()

        let cmp = 0
        for (const elem of iter) {
            expect(elem).to.eq(cmp)
            cmp += 1
        }
    })
    it('testing "maybeNext" manual', () => {
        const iter = buildIter()

        expect(iter.maybeNext()).to.deep.eq(Opt.Some(0))
        expect(iter.maybeNext()).to.deep.eq(Opt.Some(1))
        expect(iter.maybeNext()).to.deep.eq(Opt.Some(2))
        expect(iter.maybeNext()).to.deep.eq(Opt.Some(3))
        expect(iter.maybeNext()).to.deep.eq(Opt.Some(4))
        expect(iter.maybeNext()).to.deep.eq(Opt.Some(5))
        expect(iter.maybeNext()).to.deep.eq(Opt.None())
    })
    it('testing "maybeNext" loop', () => {
        const iter = buildIter()

        let cmp = 0
        let curr: Option<number> = Opt.None()
        while ((curr = iter.maybeNext()).isSome()) {
            expect(curr.val).to.eq(cmp)
            cmp += 1
        }

        expect(cmp).to.eq(6)
    })
    it('testing "count"', () => {
        const iter = buildIter()
        expect(iter.count()).to.eq(6)
    })
    it('testing "last"', () => {
        const iter = buildIter()
        expect(iter.last()).to.deep.eq(Opt.Some(5))
    })
    it('testing "map"', () => {
        const iter = buildIter();
        let cmp = 0;
        for (const elem of iter.map(i => 3 * i)) {
            expect(elem).to.eq(cmp)
            cmp += 3
        }
    })
    it('testing "filter"', () => {
        const iter = buildIter()
        let arr = []
        for (const elem of iter.filter(i => i % 2 == 0)) {
            arr.push(elem)
        }

        expect(arr).to.deep.eq([0, 2, 4])
    })
})*/