import { AbstractIter } from './internal'

////////////////////////////////////////////////////////////////////////////////////////////////////
// Option
////////////////////////////////////////////////////////////////////////////////////////////////////

export class Option<T> {
    public inner: T | undefined
    private constructor(inner?: T) {
        if (inner !== undefined) {
            this.inner = inner
        }
    }

    static Some<T>(value: T): Option<T> {
        return new Option(value)
    }

    static None<T>(): Option<T> {
        return new Option()
    }

    static from<T>(maybe?: T | undefined | null): Option<T> {
        if (maybe === null || maybe === undefined) {
            return Option.None()
        } else {
            return Option.Some(maybe)
        }
    }

    isSome(): this is { inner: T } {
        return this.inner !== undefined
    }

    isNone(): this is { inner: undefined } {
        return this.inner === undefined
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

    iter(): OptionIter<T> {
        return new OptionIter(this)
    }

    match<R>(some: (_: T) => R, none: () => R) {
        if (this.isSome()) {
            return some(this.inner)
        } else {
            return none()
        }
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

export class OptionIter<T> extends AbstractIter<T> {
    constructor(private option: Option<T>) {
        super()
    }

    next(): IteratorResult<T> {
        const res = this.option.take()
        return res.isSome() ? { done: false, value: res.inner } : { done: true, value: null }
    }
}