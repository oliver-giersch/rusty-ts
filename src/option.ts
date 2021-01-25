import { Result, ResultTag } from './lib'

////////////////////////////////////////////////////////////////////////////////////////////////////
// OptionBase
////////////////////////////////////////////////////////////////////////////////////////////////////

/** Method prototypes for the (union) {@link Option} type. */
abstract class OptionBase<T> {
    // can only be constructed by deriving classes
    protected constructor() { }

    /**
     * Returns `true` if the {@link Option} is a {@link Some} variant.
     *
     * ## Example
     *
     * Using the `isSome` type guard to narrow the {@link Option} allows the
     * contained value to be accessed directly:
     *
     * ```typescript
     * declare function getOption(): Option<string>
     *
     * const opt = getOption()
     * if (opt.isSome()) {
     *     // not possible before narrowing!
     *     console.log(opt.val)
     * }
     * ```
     *
     * @returns type guard determining, if `this` is a {@link Some} variant
     */
    isSome(this: Option<T>): this is Some<T> {
        return this.tag === Tag.Some
    }

    /**
     * Returns `true` if the {@link Option} is a {@link None} variant.
     *
     * @returns type guard determining if `this` is a {@link None} variant
     */
    isNone(this: Option<T>): this is None<never> {
        return this.tag === Tag.None
    }

    /**
     * Performs a matching operation, calling and returning the result of either
     * `some` or `none` depending on the concrete variant held by `this`.
     *
     * @param some the function called in case of a {@link Some} variant
     * @param none the function called in case of a {@link None} variant
     * @returns the result of the called function
     */
    match<R>(this: Option<T>, some: (_: T) => R, none: () => R): R {
        switch (this.tag) {
            case Tag.Some: return some(this.val)
            case Tag.None: return none()
        }
    }

    /**
     * Maps this {@link Option} to an `Option<U>` by applying `fn` to the
     * contained value, if there is one.
     *
     * @param fn the function used to transform the contained value
     * @returns the mapped {@link Option}
     */
    map<U>(this: Option<T>, fn: (_: T) => U): Option<U> {
        switch (this.tag) {
            case Tag.Some: return Option.Some(fn(this.val))
            case Tag.None: return this as unknown as Option<U>
        }
    }

    /**
     * Maps this {@link Option} to a `U` instance by either calling `fn` on the
     * contained value (if any) or returning the given default value.
     *
     * @param this
     * @param def the default value to return in the {@link None} case
     * @param fn the function used to transform the contained value
     * @returns the transformed value or the given default
     */
    mapOr<U>(this: Option<T>, def: U, fn: (_: T) => U): U {
        switch (this.tag) {
            case Tag.Some: return fn(this.val)
            case Tag.None: return def
        }
    }

    /**
     * Maps this {@link Option} to a `U` by either calling `fn` on the
     * contained value (if any) or returning the default value generated by the
     * given `def` function.
     *
     * The difference to {@link OptionBase.mapOr} is, that the default value is
     * lazily generated only if no value is contained in `this`.
     *
     * @param def the function generating the default value to return in the
     *   {@link None} case
     * @param fn the function used to transform the contained value
     * @returns the transformed value or the given default
     */
    mapOrElse<U>(this: Option<T>, def: () => U, fn: (_: T) => U): U {
        switch (this.tag) {
            case Tag.Some: return fn(this.val)
            case Tag.None: return def()
        }
    }

    /**
     * Transforms the {@link Option} into an {@link Ok} result or returns an
     * {@link Err} wrapping the given `err` value.
     *
     * @param err the error to return in the {@link None} case
     * @returns the respective {@link Result}
     */
    okOr<E>(this: Option<T>, err: E): Result<T, E> {
        switch (this.tag) {
            case Tag.Some: return Result.Ok(this.val)
            case Tag.None: return Result.Err(err)
        }
    }

    /**
     * Transform the {@link Option} into an {@link Ok} result or returns an
     * {@link Err} wrapping the result returned by `fn`.
     *
     * @param fn the function generating the {@link Err} value
     * @returns the respective {@link Result}
     */
    okOrElse<E>(this: Option<T>, fn: () => E): Result<T, E> {
        switch (this.tag) {
            case Tag.Some: return Result.Ok(this.val)
            case Tag.None: return Result.Err(fn())
        }
    }

    /**
     * Performs a logical *and* on `this` and `other`, returning `other` if both
     * are {@link Some} and {@link None} otherwise.
     *
     * @param other the other {@link Option}
     * @returns the respective {@link Option}
     */
    and<U>(this: Option<T>, other: Option<U>): Option<U> {
        switch (this.tag) {
            case Tag.Some: return other
            case Tag.None: return this as unknown as Option<U>
        }
    }

    /**
     * Performs a logical *and* on `this`, returning the {@link Option} returned
     * by `fn`, if there is a contained value or {@link None} otherwise.
     *
     * @param this
     * @param fn the function generating the alternative {@link Option}
     */
    andThen<U>(this: Option<T>, fn: (_: T) => Option<U>): Option<U> {
        switch (this.tag) {
            case Tag.Some: return fn(this.val)
            case Tag.None: return this as unknown as Option<U>
        }
    }

    /**
     * Performs a logical *or* on `this`, returning the {@link Some} value of
     * itself or otherwise `other`.
     * {@link None}.
     *
     * @param this
     * @param other the {@link Option} to compare to
     */
    or(this: Option<T>, other: Option<T>): Option<T> {
        switch (this.tag) {
            case Tag.Some: return this
            case Tag.None: return other
        }
    }

    /**
     * Performs a logical *or* on `this`, returning the {@link Option} returned
     * by `fn`, if `this` is a {@link None} variant.
     *
     * @param this
     * @param fn the function generating the alternative {@link Option}
     */
    orElse(this: Option<T>, fn: () => Option<T>): Option<T> {
        switch (this.tag) {
            case Tag.Some: return this
            case Tag.None: return fn()
        }
    }

    /**
     * Returns the contained value, if there is one, or throws a
     * {@link NoneError} exception otherwise.
     *
     * @returns the contained value
     * @throws {@link NoneError} if `this` is a {@link None} variant.
     */
    unwrap(this: Option<T>): T | never {
        switch (this.tag) {
            case Tag.Some: return this.val
            case Tag.None: throw new NoneError()
        }
    }

    /**
     * Returns the contained value, if there is one, or returns the given `def`
     * value otherwise.
     *
     * @param this
     * @param def the default value
     */
    unwrapOr(this: Option<T>, def: T): T {
        switch (this.tag) {
            case Tag.Some: return this.val
            case Tag.None: return def
        }
    }

    /**
     * Returns the contained value, if there is one, or returns the value
     * returned by `def` otherwise.
     *
     * Unlike {@link OptionBase.unwrapOr}, the default value is hence lazily
     * generated only in case there is no contained value.
     *
     * @param this
     * @param def the function generating the default value
     */
    unwrapOrElse(this: Option<T>, def: () => T): T {
        switch (this.tag) {
            case Tag.Some: return this.val
            case Tag.None: return def()
        }
    }

    /**
     * Returns the contained value, if there is one, or throws a
     * {@link NoneError} exception with a custom error `msg`.
     *
     * @param this
     * @param msg the error message provided with the thrown exception.
     * @returns the contained value
     * @throws {@link NoneError}, if `this` is a {@link None} variant.
     */
    expect(this: Option<T>, msg: string): T | never {
        switch (this.tag) {
            case Tag.Some: return this.val
            case Tag.None: throw new NoneError(msg)
        }
    }

    /**
     * Flattens an `Option<Option<T>>` to an `Option<T>`, returning the inner
     * {@link Option}, if there is one, or {@link None} otherwise.
     *
     * @param this
     */
    flatten(this: Option<Option<T>>): Option<T> {
        switch (this.tag) {
            case Tag.Some: return this.val
            case Tag.None: return Option.None
        }
    }

    /**
     * Transposes an `Option` of a {@link Result} into a {@link Result} of an
     * `Option`.
     *
     * @param this
     */
    transpose<E>(this: Option<Result<T, E>>): Result<Option<T>, E> {
        switch (this.tag) {
            case Tag.Some:
                switch (this.val.tag) {
                    case ResultTag.Ok: return Result.Ok(Option.Some(this.val.val))
                    case ResultTag.Err: return this.val as unknown as Result<Option<T>, E>
                }
            case Tag.None: return Result.Ok(Option.None)
        }
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Tag
////////////////////////////////////////////////////////////////////////////////////////////////////

/** The {@link Option} discriminant tag type. */
export const enum Tag { Some, None }

////////////////////////////////////////////////////////////////////////////////////////////////////
// Some
////////////////////////////////////////////////////////////////////////////////////////////////////

/** The {@link Option} variant containing a value. */
export class Some<T> extends OptionBase<T> {
    /** The discriminant tag. */
    readonly tag: Tag.Some
    /** The contained value. */
    readonly val: T

    /** Returns a new {@link Some} instance containing the given `val`. */
    static from<T>(val: T): Some<T> {
        return new Some(val)
    }

    private constructor(val: T) {
        super()
        this.tag = Tag.Some
        this.val = val
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// None
////////////////////////////////////////////////////////////////////////////////////////////////////

/** The {@link Option} variant containing no value. */
export class None<T> extends OptionBase<T> {
    /** The discriminant tag. */
    readonly tag: Tag.None = Tag.None

    /** Returns a new {@link None} instance. */
    static build(): None<never> {
        return new None()
    }

    private constructor() { super() }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Option
////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * The union type containing either a {@link Some} or a {@link None} variant.
 *
 * The discriminant field (`tag`) is of type {@link Tag} and (only) the
 * {@link Some} variant includes an additional `val` field.
 */
export type Option<T> = Some<T> | None<T>

/**
 * Associated (static) functions for creating {@link Option} instances.
 *
 * # Examples
 *
 * ```typescript
 * // print `true`
 * console.log(Option.Some('string').isSome()) // prints `true`
 * console.log(Option.None.isNone())
 * console.log(Option.from('string).isSome())
 * console.log(Option.from(null).isNone())
 * ```
 */
export const Option: {
    /**
     * Creates a new {@link Some} variant with the given `val`.
     *
     * @param val the (potentially nullish) value to be wrapped
     * @returns the {@link Some} variant
     */
    Some: <T>(val: T) => Option<T>,
    /**
     * A constant {@link None} instance that can be trivially copied to
     * initialize other instances.
     */
    None: Option<never>,
    /**
     * Derives a new {@link Option} instance from the (potentially nullish)
     * `val`.
     *
     * @param val the (potentially nullish) value to be wrapped
     * @returns the derived {@link Option} instance
     */
    from: <T>(val?: T | undefined | null) => Option<NonNullable<T>>
} = Object.freeze({
    Some<T>(val: T): Option<T> { return Some.from(val) },
    None: None.build(),
    from<T>(val?: T | undefined | null): Option<NonNullable<T>> {
        if (val !== undefined && val !== null) {
            return Option.Some(val as NonNullable<T>)
        } else {
            return Option.None
        }
    }
})

////////////////////////////////////////////////////////////////////////////////////////////////////
// NoneError
////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * The error that is thrown when an attempt to `unwrap` a`None` variant is made.
 */
export class NoneError extends Error {
    constructor(msg?: string) {
        super(msg ?? 'called `unwrap` on `Option.None` value')
    }
}