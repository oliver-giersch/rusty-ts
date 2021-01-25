import { Option } from './lib'

abstract class Iterator<T> implements IterableIterator<T> {
    getNext(): Option<T> {
        const next = this.next();
        return !next.done ? Option.Some(next.value) : Option.None;
    }

    count(): number {
        let count = 0;
        while (this.getNext().isSome()) {
            count += 1;
        }

        return count;
    }

    last(): Option<T> {
        let curr: Option<T> = Option.None;
        let prev = curr;

        while ((curr = this.getNext()).isSome) {
            prev = curr;
        }

        return prev;
    }

    nth(n: number): Option<T> {
        if (!Number.isInteger(n) || n < 0) {
            throw new RangeError('parameter `n` must be a positive (or zero) integer');
        }

        let curr: Option<T>;
        while ((curr = this.getNext()).isSome() && n > 0) {
            n -= 1;
        }

        return curr;
    }

    stepBy(step: number): StepByIter<T> {
        return new StepByIter(this, step);
    }

    chain(other: Iterator<T>): ChainIter<T> {
        return new ChainIter(this, other);
    }

    zip<U>(other: Iterator<U>): ZipIter<T, U> {
        return new ZipIter(this, other);
    }

    map<U>(fn: (_: T) => U): MapIter<T, U> {
        return new MapIter(this, fn);
    }

    forEach(fn: (_: T) => void) {
        for (const elem of this) {
            fn(elem);
        }
    }

    abstract next(): IteratorResult<T>;
    [Symbol.iterator]() { return this; }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// StepByIter
////////////////////////////////////////////////////////////////////////////////////////////////////

export class StepByIter<T> extends Iterator<T> {
    private current = -1;
    constructor(private iter: Iterator<T>, private step: number) {
        super();
        if (!Number.isInteger(step) || step < 0) {
            throw new RangeError('parameter `step` must be a positive (or zero) integer');
        }
    }

    next(): IteratorResult<T> {
        while (true) {
            let curr = this.iter.next();
            if (curr.done || this.current < 0 || this.current == this.step) {
                this.current += 1;
                return curr;
            }

            this.current += 1;
        }
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// ChainIter
////////////////////////////////////////////////////////////////////////////////////////////////////

export class ChainIter<T> extends Iterator<T> {
    private flip = false;
    constructor(private a: Iterator<T>, private b: Iterator<T>) {
        super();
    }

    next(): IteratorResult<T> {
        if (!this.flip) {
            const next = this.a.next();
            if (next.done === false) {
                return next;
            } else {
                this.flip = true;
                return this.next();
            }
        } else {
            return this.b.next();
        }
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// ZipIter
////////////////////////////////////////////////////////////////////////////////////////////////////

export class ZipIter<T, U> extends Iterator<[T, U]> {
    constructor(private a: Iterator<T>, private b: Iterator<U>) {
        super();
    }

    next(): IteratorResult<[T, U]> {
        const a = this.a.next();
        if (a.done === true) {
            return { done: true, value: null };
        }

        const b = this.b.next();
        if (b.done === true) {
            return { done: true, value: null };
        }

        return { done: false, value: [a.value, b.value] };
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// MapIter
////////////////////////////////////////////////////////////////////////////////////////////////////

export class MapIter<T, U> extends Iterator<U> {
    constructor(private iter: Iterator<T>, private fn: (_: T) => U) {
        super();
    }

    next(): IteratorResult<U> {
        const next = this.iter.next();
        return {
            done: next.done,
            value: this.fn(next.value)
        };
    }
}

//import { Opt, Option } from './facade'

////////////////////////////////////////////////////////////////////////////////////////////////////
// adapt
////////////////////////////////////////////////////////////////////////////////////////////////////

//export function adapt<T>(iter: IterableIterator<T>): Iter<T> {
//    return new Iter(iter)
//}

////////////////////////////////////////////////////////////////////////////////////////////////////
// AbstractIter
////////////////////////////////////////////////////////////////////////////////////////////////////

/*export abstract class AbstractIter<T> implements IterableIterator<T> {
    filter(fn: (_: T) => boolean): FilterIter<T> {
        return new FilterIter(this, fn)
    }

    filterMap<U>(fn: (_: T) => Option<U>): FilterMapIter<T, U> {
        return new FilterMapIter(this, fn)
    }

    enumerate(): EnumerateIter<T> {
        return new EnumerateIter(this)
    }

    collect(): T[] {
        let res = []
        for (const elem of this) {
            res.push(elem)
        }

        return res
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

////////////////////////////////////////////////////////////////////////////////////////////////////
// FilterIter
////////////////////////////////////////////////////////////////////////////////////////////////////

export class FilterIter<T> extends AbstractIter<T> {
    constructor(private iter: AbstractIter<T>, private fn: (_: T) => boolean) {
        super()
    }

    next(): IteratorResult<T> {
        let next
        while (!(next = this.iter.next()).done) {
            if (this.fn(next.value)) {
                return next
            }
        }

        return next
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// FilterMapIter
////////////////////////////////////////////////////////////////////////////////////////////////////

export class FilterMapIter<T, U> extends AbstractIter<U> {
    constructor(private iter: AbstractIter<T>, private fn: (_: T) => Option<U>) {
        super()
    }

    next(): IteratorResult<U> {
        let next
        while (!(next = this.iter.next()).done) {
            const res = this.fn(next.value)
            if (res.isSome()) {
                return { done: false, value: res.val }
            }
        }

        return next
    }
}*/