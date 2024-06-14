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
  names: {
    fistName: firstNameField,
    lastName: lastNameField,
    middleName: refineField(middleNameField, optional),
  },
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
    <div style={{border: state.meta.error ? '2px solid red' : '0'}}>
      <input
        {...props}
        value={state.value}
        onChange={(e) => state.setValue(e.target.value)}
      />
      {state.meta.error && <span>{state.meta.error.message}</span>}
    </div>
  )
}

const Home: NextPage = () => {
  return (
    <div>
      <Form
        onSubmit={(data, event) => {
          console.log(data)

          event?.preventDefault()
        }}
        onSubmitError={(data, event) => {
          console.log(data)
        }}
      >
        <TextInput field={firstNameField} placeholder="first name" />
        <TextInput field={lastNameField} placeholder="last name" />
        <TextInput field={middleNameField} placeholder="middle name" />

        <button type="submit">Submit</button>
      </Form>
    </div>
  )
}

export default Home
