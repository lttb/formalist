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

const {Form, register} = createForm({
  fistName: firstNameField,
  lastName: lastNameField,

  middleName: refineField(middleNameField, optional),

  contacts: {
    email: emailField,
    phone: phoneField,
  },
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
        <input {...register(firstNameField)} placeholder="First name" />
        <input {...register(lastNameField)} placeholder="Last name" />

        <input {...register(emailField)} placeholder="Email" />
        <input {...register(phoneField)} placeholder="Phone" />

        <button type="submit">Submit</button>
      </Form>
    </div>
  )
}

export default Home
