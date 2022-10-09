import { Formik, Field, Form, FormikHelpers } from 'formik';
import axios from 'axios'
import { useState } from 'react';

interface Values {
    username: string;
    password: string;
    name: string;
    email: string;
    img: string;
}

export default function Register() {
    const [imgUrl, setImgUrl] = useState({ file: '' })
    return (
        <div style={{ width: "340px" }}>
            <Formik
                initialValues={{
                    username: '',
                    password: '',
                    name: '',
                    email: '',
                    img: ''
                }}

                onSubmit={(values: Values, { setSubmitting }: FormikHelpers<Values>
                ) => {
                     values = {...values, img: imgUrl.file}
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

                    <div className="mb-3">
                        <input id="file" name="file" type="file" onChange={(event) => {
                            let reader = new FileReader();
                            let file = event.target.files[0];
                            reader.onloadend = () => {
                                setImgUrl({
                                    file: reader.result
                                });
                            };
                            reader.readAsDataURL(file);
                            // setFieldValue('img', imgUrl)
                        }}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary">Login</button>
                </Form>
            </Formik>
        </div>
    )
}