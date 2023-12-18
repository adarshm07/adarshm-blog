import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { UserProvider } from '@auth0/nextjs-auth0/client';
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Adarsh M : Software Engineer',
  description: 'Adarsh M is a proficient software engineer specializing in JavaScript, React, Node.js, MongoDB, REST API development, GraphQL, Mongoose, RedisDB, and Vue.js. With a wealth of experience in these technologies, Adarsh is adept at crafting robust and efficient web applications. His expertise extends from frontend frameworks like React and Vue.js to backend technologies such as Node.js, MongoDB, and RedisDB. Adarsh is particularly skilled in building and optimizing RESTful APIs, showcasing a comprehensive understanding of the software development lifecycle. His commitment to staying at the forefront of web development trends makes him a valuable asset in creating innovative and scalable solutions.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
      </head>
      <UserProvider>
        <body className={inter.className}>
          <MantineProvider>
            {children}
          </MantineProvider>
        </body>
      </UserProvider>
    </html>
  )
}
