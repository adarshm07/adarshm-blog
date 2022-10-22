import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux"
import Router from "next/router";

type Props = {
    children?: React.ReactNode
};

export default function AuthProvider({ children }: Props) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const userData = useSelector((state: any) => state.user);

    var config = {
        method: 'get',
        url: 'http://localhost:4000/auth/me',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userData.user.token}`
        },
        // data: {}
    };
    useEffect(() => {
        axios(config)
            .then(function (res) {
                setIsAuthenticated(true)
            })
            .catch(function (error) {
                setIsAuthenticated(false);
            });
    }, [userData])

    if (isAuthenticated) Router.push('/dashboard');
    // if (!isAuthenticated && !Router.pathname.includes('/login')) Router.push('/login')


    return (
        <div className="container">
            {!isAuthenticated && children}
        </div>
    )
}