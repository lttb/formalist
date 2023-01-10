import type {ReactNode, FC} from 'react'
import type {O, S} from 'ts-toolbelt'
import type {Struct, Infer} from 'superstruct'
import type {ObjectSchema, ObjectType} from 'superstruct/lib/utils'

import type {
  UseFormProps,
  SubmitHandler,
  SubmitErrorHandler,
} from 'react-hook-form/dist/types'

export type FieldValues = Record<string, any>

export type {Struct, Infer}

export type FieldPath<T> = keyof T | O.Paths<T>
export type FieldName<T> = T extends any[] ? S.Join<T, '.'> : T
export type FieldValue<O, P> = P extends any[]
  ? O.Path<O, P>
  : P extends undefined | void
  ? O
  : P extends keyof O
  ? O[P]
  : never

export type FieldValueType<F extends FieldType<any, any>> = Infer<F['struct']>

export type FieldType<T, S> = {struct: Struct<T, S>; id: string}

export type FieldStruct<F extends Struct<any, any>> = {struct: F; id: string}

export type Field<T, S> = {id: string; struct: Struct<T, S>}

export type FieldsObject<F extends Record<string, Field<any, any> | F>> = F

export type ObjectStructType<T extends ObjectSchema> = Struct<ObjectType<T>, T>

export type InferSchemaFromFields<F> = ObjectStructType<{
  [key in keyof F]: F[key] extends Field<any, any>
    ? F[key]['struct']
    : F[key] extends FieldsObject<any>
    ? InferSchemaFromFields<F[key]>
    : never
}>

export type FormType<T> = FC<
  UseFormProps<T> & {
    children: ReactNode
    onSubmit: SubmitHandler<T>
    onSubmitError?: SubmitErrorHandler<T>
    effects?: (Effect | null | false | undefined)[]
  }
>

export type InferFormValues<X> = X extends FormType<infer U> ? U : never

export const effectSymbol: unique symbol = Symbol('effect symbol')
export type Effect = (() => void) & {symbol: typeof effectSymbol}
