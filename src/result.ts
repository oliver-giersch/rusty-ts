////////////////////////////////////////////////////////////////////////////////////////////////////
// Result
////////////////////////////////////////////////////////////////////////////////////////////////////

export class Result<T, E> {
    private constructor(public inner: Ok<T> | Err<E>) { }

    static OK: 'ok' = 'ok'
    static ERR: 'err' = 'err'

    static Ok<T, E>(ok: T): Result<T, E> {
        return new Result({ tag: Result.OK, value: ok })
    }

    static Err<T, E>(err: E): Result<T, E> {
        return new Result({ tag: Result.ERR, value: err })
    }

    static catch<T>(fn: () => T): Result<T, Error> {
        try {
            return Result.Ok(fn())
        } catch (err) {
            if (err instanceof Error) {
                return Result.Err(err)
            }

            throw err
        }
    }

    isOk(): this is { inner: Ok<T> } {
        return this.inner.tag === Result.OK
    }

    isErr(): this is { inner: Err<E> } {
        return this.inner.tag === Result.ERR
    }

    or<F>(res: Result<T, F>): Result<T, F> {
        if (this.isOk()) {
            return Result.Ok(this.inner.value)
        } else {
            return res
        }
    }

    orElse<F>(fn: () => Result<T, F>): Result<T, F> {
        if (this.isOk()) {
            return Result.Ok(this.inner.value)
        } else {
            return fn()
        }
    }

    match<R>(ok: (_: T) => R, err: (_: E) => R): R {
        switch (this.inner.tag) {
            case Result.OK: return ok(this.inner.value)
            case Result.ERR: return err(this.inner.value)
        }
    }

    flatten(this: Result<Result<T, E>, E>): Result<T, E> {
        switch (this.inner.tag) {
            case Result.OK: return this.inner.value
            case Result.ERR: return Result.Err(this.inner.value)
        }
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Ok, Err
////////////////////////////////////////////////////////////////////////////////////////////////////

export type Ok<T> = { tag: 'ok', value: T }
export type Err<E> = { tag: 'err', value: E }