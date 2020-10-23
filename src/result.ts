import { Option } from './lib'

////////////////////////////////////////////////////////////////////////////////////////////////////
// ResultBase
////////////////////////////////////////////////////////////////////////////////////////////////////

abstract class ResultBase<T, E> {
    protected constructor() { }

    isOk(this: Result<T, E>): this is Ok<T, never> {
        return this.tag === Tag.Ok
    }

    isErr(this: Result<T, E>): this is Err<never, E> {
        return this.tag === Tag.Err
    }

    match<R>(this: Result<T, E>, ok: (_: T) => R, err: (_: E) => R): R {
        switch (this.tag) {
            case Tag.Ok: return ok(this.val)
            case Tag.Err: return err(this.err)
        }
    }

    map<U>(this: Result<T, E>, fn: (_: T) => U): Result<U, E> {
        switch (this.tag) {
            case Tag.Ok: return Result.Ok(fn(this.val))
            case Tag.Err: return this as unknown as Result<U, E>
        }
    }

    mapOr<U>(this: Result<T, E>, def: U, fn: (_: T) => U): U {
        return this.match(ok => fn(ok), _ => def)
    }

    mapOrElse<U>(this: Result<T, E>, def: () => U, fn: (_: T) => U): U {
        return this.match(ok => fn(ok), _ => def())
    }

    and<U>(this: Result<T, E>, res: Result<U, E>): Result<U, E> {
        switch (this.tag) {
            case Tag.Ok: return res
            case Tag.Err: return this as unknown as Result<U, E>
        }
    }

    andThen<U>(this: Result<T, E>, fn: (_: T) => Result<U, E>) {
        switch (this.tag) {
            case Tag.Ok: return fn(this.val)
            case Tag.Err: return this as unknown as Result<U, E>
        }
    }

    or<F>(this: Result<T, E>, res: Result<T, F>): Result<T, F> {
        switch (this.tag) {
            case Tag.Ok: return this as unknown as Result<T, F>
            case Tag.Err: return res
        }
    }

    orElse<F>(this: Result<T, E>, fn: (_: E) => Result<T, F>): Result<T, F> {
        switch (this.tag) {
            case Tag.Ok: return this as unknown as Result<T, F>
            case Tag.Err: return fn(this.err)
        }
    }

    toOk(this: Result<T, E>): Option<T> {
        switch (this.tag) {
            case Tag.Ok: return Option.Some(this.val)
            case Tag.Err: return Option.None
        }
    }

    toErr(this: Result<T, E>): Option<E> {
        switch (this.tag) {
            case Tag.Ok: return Option.None
            case Tag.Err: return Option.Some(this.err)
        }
    }

    unwrap(this: Result<T, E>): T | never {
        switch (this.tag) {
            case Tag.Ok: return this.val
            case Tag.Err: throw new UnwrapError(this.err, Tag.Ok)
        }
    }

    unwrapOr(this: Result<T, E>, def: T): T {
        switch (this.tag) {
            case Tag.Ok: return this.val
            case Tag.Err: return def
        }
    }

    unwrapOrElse(this: Result<T, E>, def: () => T): T {
        switch (this.tag) {
            case Tag.Ok: return this.val
            case Tag.Err: return def()
        }
    }

    unwrapErr(this: Result<T, E>): E | never {
        switch (this.tag) {
            case Tag.Ok: throw new UnwrapError(this.val, Tag.Err)
            case Tag.Err: return this.err
        }
    }

    expect(this: Result<T, E>, msg: string): T | never {
        switch (this.tag) {
            case Tag.Ok: return this.val
            case Tag.Err: throw new ExpectError(this.err, msg)
        }
    }

    flatten(this: Result<Result<T, E>, E>): Result<T, E> {
        switch (this.tag) {
            case Tag.Ok: return this.val
            case Tag.Err: return Result.Err(this.err)
        }
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Tag
////////////////////////////////////////////////////////////////////////////////////////////////////

export const enum Tag { Ok, Err }

////////////////////////////////////////////////////////////////////////////////////////////////////
// Ok
////////////////////////////////////////////////////////////////////////////////////////////////////

export class Ok<T, E> extends ResultBase<T, E> {
    readonly tag: Tag.Ok
    readonly val: T

    static from<T, E>(val: T): Ok<T, E> {
        return new Ok(val)
    }

    private constructor(val: T) {
        super()
        this.tag = Tag.Ok
        this.val = val
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Err
////////////////////////////////////////////////////////////////////////////////////////////////////

export class Err<T, E> extends ResultBase<T, E> {
    readonly tag: Tag.Err
    readonly err: E

    static from<T, E>(err: E): Err<T, E> {
        return new Err(err)
    }

    private constructor(err: E) {
        super()
        this.tag = Tag.Err
        this.err = err
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Result
////////////////////////////////////////////////////////////////////////////////////////////////////

export type Result<T, E> = Ok<T, E> | Err<T, E>
export const Result = Object.freeze({
    Ok<T, E>(val: T): Result<T, E> { return Ok.from(val) },
    Err<T, E>(err: E): Result<T, E> { return Err.from(err) },
    tryCatch<T, E>(fn: () => T, err: new (...args: any[]) => E): Result<T, E> {
        throw new Error('unimplemented')
    }
})

////////////////////////////////////////////////////////////////////////////////////////////////////
// UnwrapError
////////////////////////////////////////////////////////////////////////////////////////////////////

export class UnwrapError<T> extends Error {
    constructor(public val: T, expected: Tag) {
        super(expected === Tag.Ok
            ? 'called `unwrap` on an `Result.Err` value: ' + val
            : 'called `unwrapErr` on an `Result.Ok` value: ' + val
        )
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// ExpectError
////////////////////////////////////////////////////////////////////////////////////////////////////

export class ExpectError<T> extends Error {
    constructor(public val: T, msg: string) {
        super(msg + ': ' + val)
    }
}