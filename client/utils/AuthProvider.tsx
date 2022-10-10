import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux"

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
    console.log('user', isAuthenticated);

    return (
        <div className="container">
            <div className="text-center mt-5">
                {isAuthenticated && <p>You are already logged in.</p>}
            </div>
            {!isAuthenticated && children}

        </div>
    )
}