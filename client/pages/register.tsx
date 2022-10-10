import { Formik, Field, Form, FormikHelpers } from 'formik';
import axios from 'axios'
import { useState } from 'react';

interface Values {
    username: string;
    password: string;
    name: string;
    email: string;
}

export default function Register() {
    return (
        <div style={{ width: "340px" }}>
            <Formik
                initialValues={{
                    username: '',
                    password: '',
                    name: '',
                    email: '',
                }}

                onSubmit={(values: Values, { setSubmitting }: FormikHelpers<Values>
                ) => {
                    values = { ...values }
                    axios.post('http://localhost:4000/auth/register', values, { withCredentials: true })
                        .then((res) => console.log(res))
                        .then(() => setSubmitting(false))
                }}
            >
                <Form>
                    <div className="mb-3">
                        <Field className="form-control" id="name" name="name" placeholder="Name" aria-describedby="nameHelp" />
                    </div>
                    <div className="mb-3">
                        <Field className="form-control" id="email" name="email" placeholder="Email" aria-describedby="emailHelp" />
                    </div>
                    <div className="mb-3">
                        <Field className="form-control" id="username" name="username" placeholder="Username" aria-describedby="usernameHelp" />
                    </div>

                    <div className="mb-3">
                        <Field className="form-control" id="password" name="password" placeholder="Password" type="password" />
                    </div>

                    <button type="submit" className="btn btn-primary">Login</button>
                </Form>
            </Formik>
        </div>
    )
}