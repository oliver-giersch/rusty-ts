/********** exports ******************************************************************************/

export {
    Ok,
    Err,
    tryCatch
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Result
////////////////////////////////////////////////////////////////////////////////////////////////////

export type Result<T, E> = Repr<T, E> & IResult<T, E>

////////////////////////////////////////////////////////////////////////////////////////////////////
// UnwrapError
////////////////////////////////////////////////////////////////////////////////////////////////////

export class UnwrapError<E> extends Error {
    constructor(public reason: E, cause: 'ok' | 'err') {
        super(cause === 'ok'
            ? `'unwrap' called on 'Err' variant with: ${reason}`
            : `'unwrapErr' called on 'Ok' variant with: ${reason}`
        )
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Repr
////////////////////////////////////////////////////////////////////////////////////////////////////

export type Repr<T, E> = Ok<T> | Err<E>

////////////////////////////////////////////////////////////////////////////////////////////////////
// Ok & Err
////////////////////////////////////////////////////////////////////////////////////////////////////

type Ok<T> = { readonly tag: 'ok', readonly val: T }
type Err<E> = { readonly tag: 'err', readonly err: E }

////////////////////////////////////////////////////////////////////////////////////////////////////
// IResult
////////////////////////////////////////////////////////////////////////////////////////////////////

interface IResult<T, E> {
    toObj(): Repr<T, E>,
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
    unwrapOr(def: T): T,
    unwrapOrElse(def: () => T): T,
    unwrap(): T,
    unwrapErr(): E,
    flatten(this: Result<Result<T, E>, E>): Result<T, E>
}

/********** exported functions ********************************************************************/

function Ok<T, E = never>(val: T): Result<T, E> {
    return from({ tag: 'ok', val })
}

function Err<T, E>(err: E): Result<T, E> {
    return from({ tag: 'err', err })
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

function from<T, E>(repr: Repr<T, E>): Result<T, E> {
    return {
        ...repr,
        toObj() { return repr },
        isOk() { return this.tag === 'ok' },
        isErr() { return this.tag === 'err' },
        match(ok, err) {
            switch (this.tag) {
                case 'ok': return ok(this.val)
                case 'err': return err(this.err)
            }
        },
        map(fn) { return this.match(val => Ok(fn(val)), err => Err(err)) },
        mapOr(def, fn) { return this.match(val => fn(val), _ => def) },
        mapOrElse(def, fn) { return this.match(val => fn(val), _ => def()) },
        and(res) { return this.match(_ => res, err => Err(err)) },
        andThen(fn) { return this.match(ok => fn(ok), err => Err(err)) },
        or<F>(res: Result<T, F>) { return this.match(ok => Ok<T, F>(ok), _ => res) },
        orElse<F>(fn: (_: E) => Result<T, F>) {
            return this.match(ok => Ok<T, F>(ok), err => fn(err))
        },
        unwrapOr(def) { return this.match(ok => ok, _ => def) },
        unwrapOrElse(def) { return this.match(ok => ok, _ => def()) },
        unwrap() { return this.match(ok => ok, err => { throw new UnwrapError(err, 'ok') }) },
        unwrapErr() { return this.match(ok => { throw new UnwrapError(ok, 'err') }, err => err) },
        flatten() { return this.match(res => res, err => Err(err)) }
    }
}

const arr = [0, 1, 2, 3, 4]
const num = arr[100]