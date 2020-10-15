import { Opt, Option } from './facade'

/********** exports ******************************************************************************/

export {
    Ok,
    Err,
    tryCatch
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Result
////////////////////////////////////////////////////////////////////////////////////////////////////

export type Result<T, E> = (Ok<T> | Err<E>) & IResult<T, E>

////////////////////////////////////////////////////////////////////////////////////////////////////
// IResult
////////////////////////////////////////////////////////////////////////////////////////////////////

export interface IResult<T, E> {
    isOk(): this is Ok<T>,
    isErr(): this is Err<E>,
    match<R>(ok: (_: T) => R, err: (_: E) => R): R,
    map<U>(fn: (_: T) => U): Result<U, E>,
    mapOr<U>(def: U, fn: (_: T) => U): U,
    mapOrElse<U>(def: () => U, fn: (_: T) => U): U,
    and<U>(res: Result<U, E>): Result<U, E>,
    andThen<U>(fn: (_: T) => Result<U, E>): Result<U, E>,
    or<F>(res: Result<T, F>): Result<T, F>,
    orElse<F>(fn: (_: E) => Result<T, F>): Result<T, F>,
    ok(): Option<T>,
    err(): Option<E>,
    unwrapOr(def: T): T,
    unwrapOrElse(def: () => T): T,
    unwrap(): T,
    unwrapErr(): E,
    flatten(this: Result<Result<T, E>, E>): Result<T, E>
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// UnwrapError
////////////////////////////////////////////////////////////////////////////////////////////////////

export class UnwrapError<E> extends Error {
    constructor(public reason: E, cause: Tag) {
        super(cause === Tag.Ok
            ? `'unwrap' called on 'Err' variant with: ${reason}`
            : `'unwrapErr' called on 'Ok' variant with: ${reason}`
        )
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Tag
////////////////////////////////////////////////////////////////////////////////////////////////////

export const enum Tag {
    Ok,
    Err,
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Ok & Err
////////////////////////////////////////////////////////////////////////////////////////////////////

type Ok<T> = { readonly tag: Tag.Ok, readonly val: T }
type Err<E> = { readonly tag: Tag.Err, readonly err: E }

/********** exported functions ********************************************************************/

function Ok<T, E = never>(val: T): Result<T, E> {
    return from({ tag: Tag.Ok, val })
}

function Err<T, E>(err: E): Result<T, E> {
    return from({ tag: Tag.Err, err })
}

function tryCatch<T, E extends Error>(fn: () => T, err: new (...args: any[]) => E): Result<T, E> {
    try {
        return Ok(fn())
    } catch (e) {
        if (e instanceof err) {
            return Err(e)
        }

        throw e
    }
}

/********** internal functions ********************************************************************/

function from<T, E>(repr: Ok<T> | Err<E>): Result<T, E> {
    const res = Object.create(prototype)
    res.tag = repr.tag
    if (repr.tag === Tag.Ok) {
        res.val = repr.val
    } else {
        res.err = repr.err
    }

    return res
}

const prototype: IResult<any, any> = {
    isOk(this: Result<any, any>) { return this.tag === Tag.Ok },
    isErr(this: Result<any, any>) { return this.tag === Tag.Err },
    match(this: Result<any, any>, ok, err) {
        switch (this.tag) {
            case Tag.Ok: return ok(this.val)
            case Tag.Err: return err(this.err)
        }
    },
    map(fn) { return this.match(val => Ok(fn(val)), err => Err(err)) },
    mapOr(def, fn) { return this.match(val => fn(val), _ => def) },
    mapOrElse(def, fn) { return this.match(val => fn(val), _ => def()) },
    and(res) { return this.match(_ => res, err => Err(err)) },
    andThen(fn) { return this.match(ok => fn(ok), err => Err(err)) },
    or<F>(res: Result<any, F>) { return this.match(ok => Ok<any, F>(ok), _ => res) },
    orElse<F>(fn: (_: any) => Result<any, F>) {
        return this.match(ok => Ok<any, F>(ok), err => fn(err))
    },
    ok() { return this.match(ok => Opt.Some(ok), _ => Opt.None()) },
    err() { return this.match(_ => Opt.None(), err => Opt.Some(err)) },
    unwrapOr(def) { return this.match(ok => ok, _ => def) },
    unwrapOrElse(def) { return this.match(ok => ok, _ => def()) },
    unwrap() { return this.match(ok => ok, err => { throw new UnwrapError(err, Tag.Ok) }) },
    unwrapErr() { return this.match(ok => { throw new UnwrapError(ok, Tag.Err) }, err => err) },
    flatten() { return this.match(res => res, err => Err(err)) }
}