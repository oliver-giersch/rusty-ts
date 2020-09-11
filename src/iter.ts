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

abstract class AbstractIter<T, U = T> implements IterableIterator<U> {
    protected constructor(protected iter: IterableIterator<T>) { }

    maybeNext(): Option<U> {
        const next = this.next()
        return !next.done ? Option.Some(next.value) : Option.None()
    }

    count(): number {
        let count = 0;
        for (const _ of this) {
            count += 1
        }

        return count
    }

    last(): Option<U> {
        let curr = this.maybeNext()
        let prev = curr
        while (curr.isSome()) {
            prev = curr
            curr = this.maybeNext()
        }

        return prev
    }

    nth(n: number): Option<U> {
        let curr: Option<U>
        while ((curr = this.maybeNext()).isSome() && n > 0) {
            n -= 1
        }

        return curr
    }

    enumerate(): EnumerateIter<T> {
        return new EnumerateIter(this.iter)
    }

    abstract next(): IteratorResult<U>;

    [Symbol.iterator]() {
        return this
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Iter
////////////////////////////////////////////////////////////////////////////////////////////////////

export class Iter<T> extends AbstractIter<T> {
    constructor(iter: IterableIterator<T>) {
        super(iter)
    }

    map<U>(fn: (_: T) => U): MapIter<T, U> {
        return new MapIter(this.iter, fn)
    }

    next(): IteratorResult<T> {
        return this.iter.next()
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// EnumerateIter
////////////////////////////////////////////////////////////////////////////////////////////////////

export class EnumerateIter<T> extends AbstractIter<T, [number, T]> {
    private count = 0
    constructor(iter: IterableIterator<T>) {
        super(iter)
    }

    next(): IteratorResult<[number, T]> {
        const next = this.iter.next()
        const count = this.count++
        return {
            done: next.done,
            value: [count, next.value]
        }
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// MapIter
////////////////////////////////////////////////////////////////////////////////////////////////////

export class MapIter<T, U> extends AbstractIter<T, U> {
    constructor(iter: IterableIterator<T>, private fn: (_: T) => U) {
        super(iter)
    }

    next(): IteratorResult<U> {
        const next = this.iter.next()
        return {
            done: next.done,
            value: this.fn(next.value)
        }
    }
}