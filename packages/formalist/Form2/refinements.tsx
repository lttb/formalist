import {
  Struct,
  define,
  optional as optionalStruct,
  max as maxStruct,
  min as minStruct,
  size as sizeStruct,
  pattern as patternStruct,
} from 'superstruct'

import type {Field, FieldType} from './types'

export const required = <S extends Struct<any, any>, M extends string>(
  struct: S,
  message?: M,
): S =>
  define(`required_${struct.type}`, (value) => {
    if (value == null || value === '') {
      return message || 'This value is required'
    }

    const [error] = struct.validate(value)

    return error?.message || true
  }) as S

export function refineField<
  F extends Field<any, any>,
  R extends Struct<any, any>,
>({id, struct}: F, cb: (schema: F['struct']) => R): {id: string; struct: R} {
  return {id, struct: cb(struct)}
}

export const optional = <F extends Field<any, any>>(
  field: F,
): FieldType<F['struct']['TYPE'] | undefined, F['struct']['schema']> =>
  Object.assign(refineField(field, optionalStruct), {__optional__: true})

export const max = <F extends Field<any, any>>(
  field: F,
  threshold: number,
  options?: {
    exclusive?: boolean
  },
): FieldType<F['struct']['TYPE'] | undefined, F['struct']['schema']> =>
  Object.assign(
    refineField(field, (s) => maxStruct(s, threshold, options)),
    {__max__: {threshold, options}},
  )

export const min = <F extends Field<any, any>>(
  field: F,
  threshold: number,
  options?: {
    exclusive?: boolean
  },
): FieldType<F['struct']['TYPE'] | undefined, F['struct']['schema']> =>
  Object.assign(
    refineField(field, (s) => minStruct(s, threshold, options)),
    {__min__: {threshold, options}},
  )

export const pattern = <F extends Field<any, any>>(
  field: F,
  regexp: RegExp,
): FieldType<F['struct']['TYPE'] | undefined, F['struct']['schema']> =>
  Object.assign(
    refineField(field, (s) => patternStruct(s, regexp)),
    {__pattern__: {regexp}},
  )

export const size = <F extends Field<any, any>>(
  field: F,
  min: number,
  max: number = min,
): FieldType<F['struct']['TYPE'] | undefined, F['struct']['schema']> =>
  Object.assign(
    refineField(field, (s) => sizeStruct(s, min, max)),
    {
      __size__: {min, max},
      __min__: {threshold: min},
      __max__: {threshold: max},
    },
  )
