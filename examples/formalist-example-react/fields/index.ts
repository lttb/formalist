import {createField} from 'formalist'
import {string, define, coerce, refine} from 'superstruct'

// @ts-expect-error
import isEmail from 'is-email'
import {phone} from 'phone'

const Email = define<string>('Email', isEmail)

const Phone = refine(
  coerce(string(), string(), (value) => {
    const result = phone(value)

    if (!result.isValid) {
      throw new TypeError('Invalid phone number')
    }

    return result
  }),
  'Phone',
  (value) => (!phone(value).isValid ? 'Invalid phone number' : true),
)

export const firstNameField = createField(string())
export const middleNameField = createField(string())
export const lastNameField = createField(string())

export const emailField = createField(Email)

export const phoneField = createField(Phone)
