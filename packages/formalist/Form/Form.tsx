import * as React from 'react'
import {useWatch, useForm, useFormContext, FormProvider} from 'react-hook-form'
import type {
  UseFormProps,
  SubmitHandler,
  SubmitErrorHandler,
} from 'react-hook-form/dist/types'
import {nanoid} from 'nanoid'
import {object} from 'superstruct'
import {superstructResolver} from '@hookform/resolvers/superstruct'

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
): FieldStruct<S> => ({struct: required(struct), id: nanoid()})

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
      if (!(field.id in fieldsMap)) {
        // eslint-disable-next-line no-console
        console.trace('[Form] missed field', field)

        throw new Error(`[Form] field should be declared`)
      }

      return fieldsMap[field.id].name
    },
  } as React.ContextType<typeof FieldContext>

  const hooks = {
    useWatch: ((name?: any) =>
      useWatch({name: buildName(name)})) as UseWatch<T>,
    useFormContext: () => useFormContext<T>(),
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
    const methods = useForm<T>({
      ...formOptions,
      resolver: superstructResolver(fieldsStruct),
      defaultValues,
    })

    const {register, unregister} = methods

    React.useEffect(() => {
      Object.values(fieldsMap).forEach((field) => {
        register(field.name as any)
      })
      return () => {
        Object.values(fieldsMap).forEach((field) => {
          unregister(field.name as any)
        })
      }
    }, [register, unregister])

    return (
      <FieldContext.Provider value={fieldContext}>
        <FormProvider {...methods}>
          <form
            method="POST"
            onSubmit={methods.handleSubmit(onSubmit, onSubmitError)}
          >
            {children}
          </form>

          {effects.map(
            (effect, index) =>
              !!effect && <FormEffect key={String(index)} use={effect} />,
          )}
        </FormProvider>
      </FieldContext.Provider>
    )
  }

  const FieldWatcher = <N extends FieldPath<T> | undefined = undefined>({
    name,
    children,
  }: {
    name?: N
    children: (value: FieldValue<T, N>) => any
  }): JSX.Element | null => {
    const value = hooks.useWatch(name)

    const result = children(value as any)

    if (result === undefined) {
      return null
    }

    return result
  }

  return {...hooks, Form, FieldWatcher}
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
