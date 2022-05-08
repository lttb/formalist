import {createForm, Field, refineField, useField} from 'formalist'
import type {NextPage} from 'next'
import {optional} from 'superstruct'
import {
  emailField,
  firstNameField,
  lastNameField,
  middleNameField,
  phoneField,
} from '../fields'

const {Form} = createForm({
  fistName: firstNameField,
  lastName: lastNameField,
  middleName: refineField(middleNameField, optional),
  email: emailField,
  phone: phoneField,
})

const TextInput = ({
  field,
  ...props
}: {field: Field<string, null>} & JSX.IntrinsicElements['input']) => {
  const state = useField(field)

  if (state.meta.error) console.error(state.meta.error)

  return (
    <div>
      <input
        {...props}
        value={state.value}
        onChange={(e) => state.setValue(e.target.value)}
      />
      {state.meta.error && <div>{state.meta.error.message}</div>}
    </div>
  )
}

const Home: NextPage = () => {
  return (
    <div>
      <Form
        onSubmit={(data) => {
          alert('success: ' + JSON.stringify(data))
        }}
        onSubmitError={(error) => {
          alert('error: ' + JSON.stringify(error))
        }}
      >
        <TextInput field={firstNameField} placeholder="First name" />
        <TextInput field={middleNameField} placeholder="Middle name" />
        <TextInput field={lastNameField} placeholder="Last name" />

        <TextInput field={emailField} placeholder="Email" />
        <TextInput field={phoneField} placeholder="Phone" />

        <button type="submit">Submit</button>
      </Form>
    </div>
  )
}

export default Home
