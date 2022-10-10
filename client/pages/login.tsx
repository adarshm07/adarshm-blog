import { Formik, Field, Form, FormikHelpers } from 'formik';
import axios from 'axios'
import { useSelector, useDispatch } from "react-redux";
import { loggedInUser } from '../store/user';
import Layout from '../components/Layout';
import Router from 'next/router';
import AuthProvider from '../utils/AuthProvider';

interface Values {
    username: string;
    password: string;
}

export default function LoginForm() {
    const dispatch = useDispatch();
    const user = useSelector((state: any) => state.user);
    return (
        <Layout>
            <AuthProvider>
                <div className='container'>
                    <div className="row">
                        <div className="col-3 border border-1 rounded m-auto p-4 mt-5">
                            <p className='fs-5 fw-regular'>Login</p>
                            <Formik
                                initialValues={{
                                    username: '',
                                    password: '',
                                }}

                                onSubmit={(values: Values, { setSubmitting }: FormikHelpers<Values>
                                ) => {
                                    axios.post('http://localhost:4000/auth/login', values, { withCredentials: true })
                                        .then((res) => {
                                            dispatch(loggedInUser(res.data))
                                        })
                                        .then(() => {
                                            setSubmitting(false)
                                            // Router.push('/');
                                        })
                                        .catch((err) => console.log(err));
                                }}
                            >
                                <Form>
                                    <div className="mb-3">
                                        <Field className="form-control" id="username" name="username" placeholder="Username" aria-describedby="usernameHelp" />
                                    </div>

                                    <div className="mb-3">
                                        <Field className="form-control" id="password" name="password" placeholder="Password" type="password" />
                                    </div>

                                    <button type="submit" className="btn btn-primary w-100">Login</button>
                                </Form>
                            </Formik>
                        </div>
                    </div>
                    <div className="mx-auto my-4 w-50">
                        <p className='fw-light text-center' style={{ fontSize: "14px" }}>This is a personal project. At the moment for external users, I am only showing a demo, and you can access it with the demo account details.</p>
                    </div>

                </div>
            </AuthProvider>
        </Layout>
    )
}