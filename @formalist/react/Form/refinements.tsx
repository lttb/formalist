import { isNil } from 'ramda';
import { Struct, define } from 'superstruct';

import type { Field } from './types';

export const required = <S extends Struct<any, any>, M extends string>(
  struct: S,
  message?: M,
): S =>
  define(`required_${struct.type}`, (value) => {
    if (isNil(value) || value === '') {
      return message || 'This value is required';
    }

    const [error] = struct.validate(value);

    return error?.message || true;
  }) as S;

export function refineField<
  F extends Field<any, any>,
  R extends Struct<any, any>
>(
  { id, struct }: F,
  cb: (schema: F['struct']) => R,
): { id: string; struct: R } {
  return { id, struct: cb(struct) };
}
