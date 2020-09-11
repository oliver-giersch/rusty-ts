import { Option } from './option'

////////////////////////////////////////////////////////////////////////////////////////////////////
// adapt
////////////////////////////////////////////////////////////////////////////////////////////////////

export function adapt<T>(iter: IterableIterator<T>): Iter<T> {
    return new Iter(iter)
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// AbstractIter
////////////////////////////////////////////////////////////////////////////////////////////////////

export abstract class AbstractIter<T> implements IterableIterator<T> {
    maybeNext(): Option<T> {
        const next = this.next()
        return (!next.done) ? Option.Some(next.value) : Option.None()
    }

    count(): number {
        let count = 0;
        for (const _ of this) {
            count += 1
        }

        return count
    }

    last(): Option<T> {
        let curr: Option<T> = Option.None()
        let prev: Option<T> = Option.None()
        while ((curr = this.maybeNext()).isSome()) {
            prev = curr
        }

        return prev
    }

    nth(n: number): Option<T> {
        let curr: Option<T>
        while ((curr = this.maybeNext()).isSome() && n > 0) {
            n -= 1
        }

        return curr
    }

    stepBy(step: number): StepByIter<T> {
        if (step < 0) {
            throw new Error('step must be >= 0')
        }

        return new StepByIter(this, step)
    }

    enumerate(): EnumerateIter<T> {
        return new EnumerateIter(this)
    }

    map<V>(fn: (_: T) => V): MapIter<T, V> {
        return new MapIter(this, fn)
    }

    abstract next(): IteratorResult<T>;

    [Symbol.iterator]() {
        return this
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Iter
////////////////////////////////////////////////////////////////////////////////////////////////////

export class Iter<T> extends AbstractIter<T> {
    constructor(private iter: IterableIterator<T>) {
        super()
    }

    next(): IteratorResult<T> {
        return this.iter.next()
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// EnumerateIter
////////////////////////////////////////////////////////////////////////////////////////////////////

export class EnumerateIter<T> extends AbstractIter<[number, T]> {
    private enumeration = 0
    constructor(private iter: AbstractIter<T>) {
        super()
    }

    next(): IteratorResult<[number, T]> {
        const next = this.iter.next()
        const enumeration = this.enumeration++
        return {
            done: next.done,
            value: [enumeration, next.value]
        }
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// StepByIter
////////////////////////////////////////////////////////////////////////////////////////////////////

export class StepByIter<T> extends AbstractIter<T> {
    private current = -1;
    constructor(private iter: AbstractIter<T>, private step: number) {
        super()
    }

    next(): IteratorResult<T> {
        while (true) {
            let curr = this.iter.next()
            if (curr.done || this.current < 0 || this.current == this.step) {
                this.current += 1
                return curr
            }

            this.current += 1
        }
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// MapIter
////////////////////////////////////////////////////////////////////////////////////////////////////

export class MapIter<T, U> extends AbstractIter<U> {
    constructor(private iter: AbstractIter<T>, private fn: (_: T) => U) {
        super()
    }

    next(): IteratorResult<U> {
        const next = this.iter.next()
        return {
            done: next.done,
            value: this.fn(next.value)
        }
    }
}