import { Formik, Field, Form, FormikHelpers } from 'formik';
import axios from 'axios'
import { useSelector, useDispatch } from "react-redux";
import { loggedInUser } from '../store/user';
import Layout from '../components/Layout';
import AuthProvider from '../utils/AuthProvider';
import { apiDomain, domain } from '../config/mediaUrls';

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
                <div className='container mx-auto mt-40 p-6'>
                    <div className="block bg-white max-w-sm p-6 mx-auto dark:bg-slate-800 rounded-lg px-6 py-8 ring-1 ring-slate-900/5">
                        <p className='inline bg-gradient-to-r from-indigo-200 via-sky-400 to-indigo-200 bg-clip-text font-display text-xl tracking-tight text-transparent'>Login</p>
                        <Formik
                            initialValues={{
                                username: '',
                                password: '',
                            }}

                            onSubmit={(values: Values, { setSubmitting }: FormikHelpers<Values>
                            ) => {
                                axios.post(`${apiDomain}/auth/login`, values, {
                                    headers: {
                                        "Content-Type": "application/json",
                                        'Access-Control-Allow-Origin': '*',
                                        'Access-Control-Allow-Credentials': true,
                                    }
                                })
                                    .then((res: any) => {
                                        dispatch(loggedInUser(res.data))
                                    })
                                    .then(() => {
                                        setSubmitting(false)
                                        // Router.push('/');
                                    })
                                    .catch((err) => console.log(err.message));
                            }}
                        >
                            <Form>
                                <div className="mt-6 mb-6">
                                    <Field className="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none" id="username" name="username" placeholder="Username" aria-describedby="usernameHelp" />
                                </div>

                                <div className="form-group mb-6">
                                    <Field className="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none" id="password" name="password" placeholder="Password" type="password" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-start">
                                        <div className="flex items-center h-5">
                                            <Field type="checkbox" id="remember" name="remember" className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800" />
                                        </div>
                                        <div className="ml-3 text-sm">
                                            <label htmlFor="remember" className="text-gray-500 dark:text-gray-300">Remember me</label>
                                        </div>
                                    </div>
                                    <a href="#" className="text-sm text-primary-500 text-gray-500 hover:underline dark:text-primary-500">Forgot password?</a>
                                </div>

                                <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white mt-6 font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out">Login</button>

                                <p className="text-sm font-light text-gray-500 dark:text-gray-400 mt-6">
                                    Don&apos;t have an account yet? <a href="#" className="font-medium text-primary-600 hover:underline dark:text-primary-500">Sign up</a>
                                </p>
                            </Form>
                        </Formik>
                    </div>
                </div>
            </AuthProvider>
        </Layout >
    )
}