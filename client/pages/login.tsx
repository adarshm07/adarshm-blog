import { Formik, Field, Form, FormikHelpers } from 'formik';
import axios from 'axios'
import { useSelector, useDispatch } from "react-redux";
import { loggedInUser } from '../store/user';
import Layout from '../components/Layout';

interface Values {
    username: string;
    password: string;
}

export default function LoginForm() {
    const dispatch = useDispatch();
    const user = useSelector((state: any) => state.user);
    return (
        <Layout>
            <div className='container'>
                <div className='d-flex justify-content-center align-items-center vh-100 col-6 m-auto'>
                    <Formik
                        initialValues={{
                            username: '',
                            password: '',
                        }}

                        onSubmit={(values: Values, { setSubmitting }: FormikHelpers<Values>
                        ) => {
                            axios.post('http://localhost:4000/auth/login', values, { withCredentials: true })
                                .then((res) => {
                                    // console.log(res);
                                    dispatch(loggedInUser(res.data))
                                })
                                .then(() => setSubmitting(false))
                        }}
                    >
                        <Form>
                            <div className="mb-3">
                                <Field className="form-control" id="username" name="username" placeholder="Username" aria-describedby="usernameHelp" />
                            </div>

                            <div className="mb-3">
                                <Field className="form-control" id="password" name="password" placeholder="Password" type="password" />
                            </div>

                            <button type="submit" className="btn btn-primary">Login</button>
                            {/* <button onClick={() => dispatch(loggedInUser(""))}>Logout</button> */}
                        </Form>
                    </Formik>
                </div>
            </div>
        </Layout>
    )
}