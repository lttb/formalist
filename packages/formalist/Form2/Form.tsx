import * as React from 'react'
import type {
  UseFormProps,
  SubmitHandler,
  SubmitErrorHandler,
} from 'react-hook-form/dist/types'
import {nanoid} from 'nanoid'
import {object, create} from 'superstruct'

import type {
  Struct,
  Infer,
  FieldStruct,
  Field,
  FieldsObject,
  InferSchemaFromFields,
  FieldValues,
  FieldPath,
  FieldValue,
  FormType,
  Effect,
} from './types'
import {FieldContext} from './hooks'
import {required} from './refinements'

const buildName = (name: any | any[]) =>
  Array.isArray(name) ? name.join('.') : name

/**
 * By default all fields are required
 *
 * Use s.optional in form declaration if needed
 *
 * refineField($myField, s.optional)
 */
export const createField = <S extends Struct<any, any>>(
  struct: S,
  id?: string,
): FieldStruct<S> => ({struct: struct, id: id || nanoid()})

const isField = (v: any): v is Field<any, any> => Boolean(v.struct && v.id)

export type IForm<T> = UseFormProps<T> & {
  children: React.ReactNode
  onSubmit: SubmitHandler<T>
  onSubmitError?: SubmitErrorHandler<T>
}

type UseWatch<T extends FieldValues> = (() => T) &
  (<N extends FieldPath<T>>(name?: N) => FieldValue<T, N>)

export const createForm = <
  F extends FieldsObject<any>,
  S extends InferSchemaFromFields<F>,
  T extends Infer<S>,
>(
  fields: F,
) => {
  const fieldsMap = {} as React.ContextType<typeof FieldContext>

  function traverse(node: FieldsObject<any>, path: string[] = []) {
    const fieldsSchema = {} as any

    for (const [key, value] of Object.entries(node)) {
      const currentPath = path.concat(key)

      if (isField(value)) {
        fieldsSchema[key] = value.struct

        fieldsMap[value.id] = {
          name: buildName(currentPath),
          path: currentPath,
          struct: value.struct,
        }
      } else {
        fieldsSchema[key] = traverse(value, currentPath)
      }
    }

    return object(fieldsSchema)
  }

  const fieldsStruct = traverse(fields)

  const fieldContext = {
    ...fieldsMap,

    getFieldName: (field) => {
      if (!(field.id in fieldContext)) {
        // eslint-disable-next-line no-console
        console.trace('[Form] missed field', field)

        throw new Error(`[Form] field should be declared`)
      }

      return fieldContext[field.id].name
    },
  } as React.ContextType<typeof FieldContext>

  const set = (obj: any, path: string[], value: any) => {
    let currObj = obj
    path.forEach((key, index) => {
      if (index === path.length - 1) {
        currObj[key] = value
      } else {
        currObj[key] = currObj[key] || {}
        currObj = currObj[key]
      }
    })
    return obj
  }

  const restore = (keys: string[], obj: any, cb: any) => {
    const result = Object.create(null)
    keys.forEach((key) => {
      const val = fieldsMap[key]

      set(result, val.path, cb(obj[key]))
    })
    return result
  }

  const handleSubmit = (onSubmit, onSubmitError) => (event) => {
    event?.preventDefault()

    const keys = Object.keys(fieldsMap)

    try {
      // there could be issues with nested coercions
      // see https://github.com/ianstormtaylor/superstruct/pull/1038
      const data = create(
        restore(keys, event.currentTarget.elements, (x: any) => x?.value),
        fieldsStruct,
      )

      onSubmit(data as any, event)
    } catch (error: any) {
      onSubmitError && onSubmitError(error, event)
    }
  }

  const Form: FormType<T> = ({
    onSubmit,
    onSubmitError,
    children,
    defaultValues,
    resolver,
    effects = [],
    ...formOptions
  }) => {
    return (
      <FieldContext.Provider value={fieldContext}>
        <form onSubmit={handleSubmit(onSubmit, onSubmitError)}>{children}</form>
      </FieldContext.Provider>
    )
  }

  return {Form, handleSubmit}
}

export const createFormEffect =
  <T extends any[]>(effect: (...args: T) => void) =>
  (...args: T): Effect =>
    (() => effect(...args)) as Effect

// TODO: think about same effects deduplication
export const FormEffect = ({use}: {use: Effect}) => {
  use()

  return null
}
