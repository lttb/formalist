import {createField} from 'formalist/index2'
import {
  string,
  define,
  coerce,
  number,
  refine,
  StructError,
  Context,
  Struct,
  object,
  boolean,
} from 'superstruct'

// @ts-expect-error
import isEmail from 'is-email'
import {phone, PhoneValidResult} from 'phone'
import {toFailure} from 'superstruct/lib/utils'

const Email = define<string>('Email', isEmail)

class CustomStructError extends StructError {
  constructor(
    message: string,
    context: Context,
    struct: Struct<any, any>,
    value: any,
  ) {
    super(
      {
        branch: context.branch,
        key: undefined,
        message: message,
        path: context.path,
        refinement: undefined,
        type: struct.type,
        value,
      },
      () => ({} as any),
    )
  }
}

const Phone = coerce(
  object({
    isValid: boolean(),
    countryCode: string(),
    countryIso2: string(),
    countryIso3: string(),
    phoneNumber: string(),
  }),
  string(),
  (value, ctx) => {
    console.log('phone', value)

    const result = phone(value)

    if (!result.isValid) {
      throw new CustomStructError('Invalid phone number', ctx, Phone, value)
    }

    return result
  },
)

export const firstNameField = createField(string(), 'firstName')
export const middleNameField = createField(string(), 'middleName')
export const lastNameField = createField(string(), 'lastName')

export const emailField = createField(Email, 'email')

export const phoneField = createField(Phone, 'phone')
