import React, { useState } from 'react';
import Layout from './index';

type Props = {
    children?: React.ReactNode
};

export default function DashboardLayout({ children }: Props) {
    return (
        <Layout>
            {children}
        </Layout>
    );
}