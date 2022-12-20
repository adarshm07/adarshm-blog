import React from "react";
import Header from "../Header";

type Props = {
    children?: React.ReactNode
};

export default function Layout({ children }: Props) {
    return (
        <React.Fragment>
            <Header />
            <div style={{ marginTop: "4rem" }}>
                {children}
            </div>
        </React.Fragment>
    )
}