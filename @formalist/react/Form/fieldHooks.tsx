import { useMemo } from 'react';
import { Status } from '@bulb/design/modules/FormGroup';

import type { Infer, Field } from './types';
import { useField, useFormState } from './hooks';

const getFieldStatus = (
  isFormSubmitted: boolean,
  isFieldInvalid: boolean,
): Status => {
  if (isFieldInvalid) {
    return 'invalid';
  }

  return isFormSubmitted ? 'valid' : 'unknown';
};

type HookOptions<
  F extends Field<any, any>,
  V = Infer<F['struct']>,
  RawValueType = string
> = V extends RawValueType
  ? [{ mapValue?: (value: RawValueType) => V }?]
  : [{ mapValue: (value: RawValueType) => V }];

type HookArgs<F extends Field<any, any>> = [field: F, ...rest: HookOptions<F>];

function useCommonField<F extends Field<any, any>>(
  type: string,
  ...args: HookArgs<F>
) {
  const [field, { mapValue = (x: string) => x } = {}] = args;
  const formState = useFormState();
  const fieldState = useField(field);
  const id = useMemo(() => `${type}-${fieldState.meta.name}`, [
    type,
    fieldState.meta.name,
  ]);

  return { field, mapValue, formState, fieldState, id };
}

const createCommonFieldHook = (controllerName: string) =>
  function useField<F extends Field<any, any>>(...args: HookArgs<F>) {
    const { id, formState, fieldState, mapValue } = useCommonField(
      controllerName,
      ...args,
    );

    return {
      id,
      name: fieldState.meta.name,
      status: getFieldStatus(formState.isSubmitted, !fieldState.meta.isValid),
      errorMessage: fieldState.meta.error?.message,
      value: fieldState.value || '',
      onChange: (event: React.ChangeEvent<any>) => {
        fieldState.setValue(mapValue(event.target.value));
      },
    };
  };

export const useDropdownField = createCommonFieldHook('dropdown');

export const useTextInputField = createCommonFieldHook('text-input');

export function useTypeaheadField<F extends Field<any, any>>(
  ...args: HookArgs<F>
) {
  const { fieldState, mapValue } = useCommonField('text-input', ...args);

  return {
    status: fieldState.meta.isValid ? 'unknown' : ('invalid' as any),
    errorMessage: fieldState.meta.error?.message,
    value: fieldState.value,
    onItemSelection: (...args: any[]) => {
      fieldState.setValue(mapValue(args[0]?.id));
    },
  };
}

export const useRadioButtons = createCommonFieldHook('radio-buttons');

export const useCheckboxField = createCommonFieldHook('checkbox');
