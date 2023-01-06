import Head from "next/head";
import React from "react";
import Header from "../Header";
import ScrollToTop from "../ScrollToTop";

type Props = {
    children?: React.ReactNode,
    background?: string,
    classnames?: string
};

export default function Layout({ children, background, classnames }: Props) {
    return (
        <React.Fragment>
            <Head>
                <title>Adarsh M : Full Stack Developer</title>
                <meta name="description" content="Generated by create next app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Header />
            <div className={classnames} style={{ background: `${background}`, height: "100%" }}>
                {children}
            </div>
            <ScrollToTop />
        </React.Fragment >
    )
}