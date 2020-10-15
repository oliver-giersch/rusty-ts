import { Res, Result } from './facade'

/********** exports ******************************************************************************/

export {
    from,
    Some,
    None
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Option
////////////////////////////////////////////////////////////////////////////////////////////////////

export type Option<T> = (Some<T> | None) & IOption<T>

////////////////////////////////////////////////////////////////////////////////////////////////////
// NoneError
////////////////////////////////////////////////////////////////////////////////////////////////////

/// Error that is throw when an attempt to `unwrap` a`None` variant is made.
export class NoneError extends Error {
    constructor() {
        super('unwrap called on "None" variant')
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Tag
////////////////////////////////////////////////////////////////////////////////////////////////////

export const enum Tag {
    Some,
    None
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Some & None
////////////////////////////////////////////////////////////////////////////////////////////////////

type Some<T> = { readonly tag: Tag.Some, readonly val: T }
type None = { readonly tag: Tag.None }

////////////////////////////////////////////////////////////////////////////////////////////////////
// IOption
////////////////////////////////////////////////////////////////////////////////////////////////////

interface IOption<T> {
    isSome(): this is Some<T>,
    isNone(): this is None,
    match<R>(some: (_: T) => R, none: () => R): R,
    map<U>(fn: (_: T) => U): Option<U>,
    mapOr<U>(def: U, fn: (_: T) => U): U,
    mapOrElse<U>(def: () => U, fn: (_: T) => U): U,
    okOr<E>(err: E): Result<T, E>,
    okOrElse<E>(fn: () => E): Result<T, E>,
    and<U>(opt: Option<U>): Option<U>,
    andThen<U>(fn: (_: T) => Option<U>): Option<U>,
    or(opt: Option<T>): Option<T>,
    orElse(fn: () => Option<T>): Option<T>,
    unwrap(): T,
    unwrapOr(def: T): T,
    unwrapOrElse(def: () => T): T,
    flatten(this: Option<Option<T>>): Option<T>,
    transpose<E>(this: Option<Result<T, E>>): Result<Option<T>, E>,
}

/********** exported functions ********************************************************************/

function from<T>(val: T | undefined | null): Option<NonNullable<T>> {
    return val === undefined || val === null ? None() : Some(val as NonNullable<T>)
}

function Some<T>(val: T): Option<T> {
    return buildOption({ tag: Tag.Some, val })
}

function None(): Option<never> {
    return buildOption({ tag: Tag.None })
}

/********** internal functions ********************************************************************/

function buildOption<T extends NonNullable<any>>(repr: Some<T> | None): Option<T> {
    const opt = Object.create(prototype)
    opt.tag = repr.tag
    if (repr.tag === Tag.Some) {
        opt.val = repr.val
    }

    return opt
}

const prototype: IOption<any> = Object.freeze({
    isSome(this: Option<any>) { return this.tag === Tag.Some },
    isNone(this: Option<any>) { return this.tag === Tag.None },
    match(this: Option<any>, some, none) {
        switch (this.tag) {
            case Tag.Some: return some(this.val)
            case Tag.None: return none()
        }
    },
    map(fn) { return this.match(some => Some(fn(some)), () => None()) },
    mapOr(def, fn) { return this.match(some => fn(some), () => def) },
    mapOrElse(def, fn) { return this.match(some => fn(some), () => def()) },
    okOr(err) { return this.match(some => Res.Ok(some), () => Res.Err(err)) },
    okOrElse(fn) { return this.match(some => Res.Ok(some), () => Res.Err(fn())) },
    and(opt) { return this.match(some => opt, () => None()) },
    andThen(fn) { return this.match(some => fn(some), () => None()) },
    or(opt) { return this.match(some => Some(some), () => opt) },
    orElse(fn) { return this.match(some => Some(some), () => fn()) },
    unwrap() { return this.match(some => some, () => { throw new NoneError() }) },
    unwrapOr(def) { return this.match(some => some, () => def) },
    unwrapOrElse(def) { return this.match(some => some, () => def()) },
    flatten() { return this.match(some => some, () => None()) },
    transpose<E>(this: Option<Result<any, E>>): Result<Option<any>, E> {
        return this.match(
            some => some.match(ok => Res.Ok(Some(ok)), err => Res.Err(err)),
            () => Res.Ok(None())
        )
    }
})