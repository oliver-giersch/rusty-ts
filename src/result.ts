///////////////////////////////////////////////////////////////////////////////////////////////////////////
// Result
///////////////////////////////////////////////////////////////////////////////////////////////////////////

export class Result<T, E> {
    private constructor(public repr: Ok<T> | Err<E>) {}

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

    isOk(): this is { repr: Ok<T> } {
        return this.repr.tag === 'ok'
    }

    isErr(): this is { repr: Err<E> } {
        return this.repr.tag === 'err'
    }

    or<F>(res: Result<T, F>): Result<T, F> {
        if (this.isOk()) {
            return Result.Ok(this.repr.value)
        } else {
            return res
        }
    }

    orElse<F>(fn: () => Result<T, F>): Result<T, F> {
        if (this.isOk()) {
            return Result.Ok(this.repr.value)
        } else {
            return fn()
        }
    }

    flatten(this: Result<Result<T, E>, E>): Result<T, E> {
        if (this.isOk()) {
            return this.repr.value
        } else if (this.isErr()) {
            return Result.Err(this.repr.value)
        }
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////
// Ok & Err
///////////////////////////////////////////////////////////////////////////////////////////////////////////

export type Ok<T> = { tag: 'ok', value: T }
export type Err<E> = { tag: 'err', value: E }