import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { useSelector } from "react-redux";
import { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import GlitchText from '../components/GlitchText';

const Home: NextPage = () => {
  const user = useSelector((state: any) => state.user);
  const [posts, setPosts] = useState<[]>([]);

  useEffect(() => {
    const listAllPosts = async () => {
      await axios.get('http://localhost:4000/posts/allposts')
        .then((res: any) => {
          setPosts(res.data)
        })
        .catch((err: Error) => console.log(err));
    }

    listAllPosts()
  }, [])

  return (
    <div>
      <Head>
        <title>Adarsh M : Full Stack Developer</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        <div className={styles.container} style={{ height: "70vh", display: "flex", justifyContent: "center", alignItems: "flex-end" }}>
          <GlitchText title="Full Stack Developer" />
        </div>
      </Layout>
    </div>
  )
}

export default Home
