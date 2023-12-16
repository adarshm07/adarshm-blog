"use client"
import { Box, Button, Checkbox, Group, PasswordInput, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';

type FormValues = {
    name: string;
    email: string;
    password: string;
    username: string;
    termsOfService: boolean;
}

type RegisterType = {
    name: string;
    email: string;
    password: string;
    username: string;
}

export default function Register() {
    const form = useForm<FormValues>({
        initialValues: {
            name: '',
            email: '',
            password: '',
            username: '',
            termsOfService: false,
        },

        validate: {
            email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
        },
    });

    const handleSubmit = async (values: RegisterType) => {
        const formValues = JSON.stringify({
            "name": values.name,
            "email": values.email,
            "password": values.password,
            "username": values.username,
            "client_id": "tFDZ3amETf41l7OqTRwfFzKLSg8pqbUk",
            "connection": "Username-Password-Authentication",
        })

        const res = await fetch("https://dev-hh68fy1m.us.auth0.com/dbconnections/signup", {
            "method": "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: formValues
        })

        const data = await res.json();
        console.log(data);

    }

    return (
        <div>
            <h1>Register</h1>
            <Box maw={340} mx="auto">
                <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
                    <TextInput
                        withAsterisk
                        label="Name"
                        placeholder="Name"
                        {...form.getInputProps('name')}
                    />

                    <TextInput
                        withAsterisk
                        label="Email"
                        placeholder="your@email.com"
                        {...form.getInputProps('email')}
                    />

                    <PasswordInput
                        withAsterisk
                        label="Password"
                        placeholder="************"
                        {...form.getInputProps('password')}
                    />

                    <TextInput
                        withAsterisk
                        label="Username"
                        placeholder="username"
                        {...form.getInputProps('username')}
                    />

                    <Checkbox
                        mt="md"
                        label="I agree to sell my privacy"
                        {...form.getInputProps('termsOfService', { type: 'checkbox' })}
                    />

                    <Group justify="flex-end" mt="md">
                        <Button type="submit">Submit</Button>
                    </Group>
                </form>
            </Box>
        </div>
    )
}