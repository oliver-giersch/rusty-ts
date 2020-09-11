////////////////////////////////////////////////////////////////////////////////////////////////////
// Result
////////////////////////////////////////////////////////////////////////////////////////////////////

export class Result<T, E> {
    private constructor(public inner: Ok<T> | Err<E>) { }

    static Ok<T, E>(ok: T): Result<T, E> {
        return new Result({ tag: 'ok', value: ok })
    }

    static Err<T, E>(err: E): Result<T, E> {
        return new Result({ tag: 'err', value: err })
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
        return this.inner.tag === 'ok'
    }

    isErr(): this is { inner: Err<E> } {
        return this.inner.tag === 'err'
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

    flatten(this: Result<Result<T, E>, E>): Result<T, E> {
        switch (this.inner.tag) {
            case 'ok': return this.inner.value
            case 'err': return Result.Err(this.inner.value)
        }
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Tag, Ok, Err
////////////////////////////////////////////////////////////////////////////////////////////////////

export type Tag = 'ok' | 'err'
export type Ok<T> = { tag: 'ok', value: T }
export type Err<E> = { tag: 'err', value: E }