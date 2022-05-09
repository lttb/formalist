import {
  createContext,
  useContext,
  useRef,
  useMemo,
  useEffect,
  useState,
} from 'react'
import {
  useFormState,
  useWatch,
  useFormContext as useReactFormContext,
  get,
  ErrorOption,
} from 'react-hook-form'

import type {Infer, Field, FieldValueType, FieldType, Struct} from './types'

export const globalFieldContext = {
  // getFieldName: (field) => {
  //   if (!(field.id in globalFieldContext)) {
  //     // eslint-disable-next-line no-console
  //     console.trace('[Form] missed field', field)
  //     throw new Error(`[Form] field should be declared`)
  //   }
  //   return globalFieldContext[field.id].name
  // },
}

export const FieldContext = createContext<
  Record<
    string,
    {
      id: string
      name: string
      path: string[]
      struct: Struct<any, any>
      field: FieldType<any, any>
    }
  > & {
    getFieldName: <F extends FieldType<any, any>>(field: F) => any
    register: <F extends FieldType<any, any>>(
      field: F,
    ) => {name: string; required?: boolean}
  }
>(globalFieldContext as any)

export {useFormState}

export function useFieldMethods() {
  const [, setState] = useState<Record<string, string>>()
  const forceRender = () => setState({})

  const {getFieldName} = useContext(FieldContext)

  const methods = useReactFormContext()
  const ref = useRef(methods)
  useEffect(() => {
    ref.current = methods
  })
  const watchRefs = useRef<Record<string, any>>({})

  const handlers = useMemo(() => {
    const {_subjects} = ref.current.control

    const result = {
      watch<F extends FieldType<any, any>>(field: F): FieldValueType<F> {
        const name = getFieldName(field)

        const value = result.getValue(field)

        if (!(name in watchRefs.current)) {
          watchRefs.current[name] = _subjects.state.subscribe({
            next({name: fieldName}) {
              if (fieldName !== name) return

              forceRender()
            },
          })
        }

        return value
      },

      setValue: <F extends FieldType<any, any>>(
        field: F,
        value: FieldValueType<F>,
      ): void => {
        result.clearError(field)

        ref.current.setValue(getFieldName(field), value, {
          shouldDirty: true,
          shouldValidate: true,
        })
      },
      getValue: <F extends FieldType<any, any>>(field: F): FieldValueType<F> =>
        ref.current.getValues(getFieldName(field)),
      clearValue: <F extends FieldType<any, any>>(field: F): void =>
        ref.current.setValue(getFieldName(field), undefined, {
          shouldDirty: true,
          shouldValidate: true,
        }),

      setError: <F extends FieldType<any, any>>(
        field: F,
        error: ErrorOption,
      ) => {
        /**
         * Workaround to schedule live error setting
         */
        setTimeout(() => {
          ref.current.setError(getFieldName(field), error)
        }, 0)
      },
      getError: <F extends FieldType<any, any>>(field: F): ErrorOption =>
        get(ref.current.formState.errors, getFieldName(field)),
      clearError: <F extends FieldType<any, any>>(field: F) => {
        ref.current.clearErrors(getFieldName(field))
      },
    }

    return result
  }, [getFieldName])

  useEffect(() => {
    const subs = watchRefs.current

    return () => {
      Object.values(subs).forEach((sub) => {
        sub.unsubscribe()
      })
    }
  }, [])

  return handlers
}

export function useField<F extends Field<any, any>>(field: F) {
  type Value = Infer<F['struct']>

  const name = useContext(FieldContext).getFieldName(field)

  const methods = useReactFormContext()

  const ref = useRef(methods)

  useEffect(() => {
    ref.current = methods
  })

  const value = useWatch({name})
  const valueRef = useRef(value)

  useEffect(() => {
    valueRef.current = value
  })

  const fieldState = useMemo(() => {
    const meta = {
      name,

      get error() {
        return get(ref.current.formState.errors, name)
      },
      get isValid() {
        return !meta.error
      },
      get isDirty() {
        return !!get(ref.current.formState.dirtyFields, name)
      },
      get isTouched() {
        return !!get(ref.current.formState.touchedFields, name)
      },
    }

    const result = {
      meta,

      get value(): Value {
        return valueRef.current
      },

      setValue: async (value: Value) => {
        result.clearError()

        ref.current.setValue(name, value, {
          shouldDirty: true,
          shouldValidate: true,
        })
      },
      clearValue() {
        ref.current.setValue(name, undefined, {
          shouldDirty: true,
          shouldValidate: true,
        })
      },

      setError: (error: ErrorOption) => {
        /**
         * Workaround to schedule live error setting
         */
        setTimeout(() => {
          ref.current.setError(name, error)
        }, 0)
      },
      clearError: () => {
        ref.current.clearErrors(name)
      },
    }

    return result
  }, [name])

  return fieldState
}
