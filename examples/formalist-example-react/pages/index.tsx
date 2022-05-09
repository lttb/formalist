import {createForm, optional, pattern, refineField} from 'formalist/index2'
import type {NextPage} from 'next'
import {
  emailField,
  firstNameField,
  lastNameField,
  middleNameField,
  phoneField,
} from '../fields'

const {Form, register} = createForm({
  fistName: firstNameField,
  lastName: pattern(lastNameField, /[a-z]+/),

  middleName: optional(middleNameField),

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
        <div style={{display: 'inline-flex', flexDirection: 'column', gap: 20}}>
          <input {...register(firstNameField)} placeholder="First name" />
          <input {...register(lastNameField)} placeholder="Last name" />

          <input {...register(middleNameField)} placeholder="Middle name" />

          <input {...register(emailField)} type="email" placeholder="Email" />
          <input {...register(phoneField)} type="tel" placeholder="Phone" />

          <button type="submit">Submit</button>
        </div>
      </Form>
    </div>
  )
}

export default Home
