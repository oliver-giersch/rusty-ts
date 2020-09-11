import { Iter } from './iter'

////////////////////////////////////////////////////////////////////////////////////////////////////
// Option
////////////////////////////////////////////////////////////////////////////////////////////////////

export class Option<T> {
    public inner: T | undefined
    private constructor(inner?: T) {
        if (typeof inner !== 'undefined') {
            this.inner = inner
        }
    }

    static Some<T>(value: T): Option<T> {
        return new Option(value)
    }

    static None<T>(): Option<T> {
        return new Option()
    }

    static from<T>(maybe: T | undefined | null): Option<T> {
        return maybe ? Option.Some(maybe) : Option.None()
    }

    isSome(): this is { inner: T } {
        return typeof this.inner !== 'undefined'
    }

    isNone(): this is { inner: undefined } {
        return typeof this.inner === 'undefined'
    }

    unwrap(): T {
        if (this.isSome()) {
            return this.inner
        } else {
            throw new NoneError()
        }
    }

    unwrapOr(alt: T): T {
        return this.isSome() ? this.inner : alt
    }

    unwrapOrElse(fn: () => T): T {
        return this.isSome() ? this.inner : fn()
    }

    take(): Option<T> {
        const res = Option.from(this.inner)
        this.inner = undefined
        return res
    }

    iter(): Iter<T> {
        throw new Error('unimplemented')
    }

    flatten(this: Option<Option<T>>): Option<T> {
        return this.isSome() ? this.inner : Option.None()
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// NoneError
////////////////////////////////////////////////////////////////////////////////////////////////////

export class NoneError extends Error {
    constructor() {
        super('unwrap called on "None" variant')
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// OptionIter
////////////////////////////////////////////////////////////////////////////////////////////////////

export class OptionIter<T> implements IterableIterator<T> {
    constructor(private option: Option<T>) { }

    next(): IteratorResult<T> {
        const res = this.option.take()
        if (res.isSome()) {
            return { done: false, value: res.inner }
        } else {
            return { done: true, value: null }
        }
    }

    [Symbol.iterator]() {
        return this
    }
}