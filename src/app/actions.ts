"use server"

type LoginType = {
    email: string;
    password: string;
}

export async function handleSubmit(values: LoginType): Promise<void> {
    const formValues = JSON.stringify({
        "email": values.email,
        "password": values.password,
        "client_id": process.env.AUTH0_CLIENT_ID,
        "client_secret": process.env.AUTH0_CLIENT_SECRET,
        "audience": "https://dev-hh68fy1m.us.auth0.com/api/v2/",
        "grant_type": "client_credentials",
    })

    const res = await fetch("https://dev-hh68fy1m.us.auth0.com/oauth/token", {
        "method": "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: formValues
    })

    const data = await res.json();
    // console.log(data);
    return data;
}