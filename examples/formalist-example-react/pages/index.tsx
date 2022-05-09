import {createForm, refineField} from 'formalist/index2'
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

  contacts: {
    email: emailField,
    phone: phoneField,
  },

  // middleName: refineField(middleNameField, optional),
  // email: emailField,
  // phone: phoneField,
})

const Home: NextPage = () => {
  return (
    <div>
      <Form
        onSubmit={(data) => {
          console.log(data)
        }}
        onSubmitError={(error) => {
          console.error(error)
        }}
      >
        <input name={firstNameField.id} placeholder="First name" />
        <input name={lastNameField.id} placeholder="Last name" />

        <input name={emailField.id} placeholder="Email" />
        <input name={phoneField.id} placeholder="Phone" />

        <button type="submit">Submit</button>
      </Form>
    </div>
  )
}

export default Home
