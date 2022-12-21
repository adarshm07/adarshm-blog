import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.scss'
import { useSelector } from "react-redux";
import { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import GlitchText from '../components/GlitchText';
import MultiColorText from '../components/MultiColorText';
import FloatingButton from '../components/FloatingButton';
import { apiDomain, ResumeLink } from '../config/mediaUrls';

const Home: NextPage = () => {
  const user = useSelector((state: any) => state.user);
  const [posts, setPosts] = useState<[]>([]);

  useEffect(() => {
    const listAllPosts = async () => {
      await axios.get(`${apiDomain}/posts/allposts`)
        .then((res: any) => {
          setPosts(res.data)
        })
        .catch((err: Error) => console.log(err));
    }

    listAllPosts()
  }, [])

  return (
    <div className='open'>
      <Head>
        <title>Adarsh M : Full Stack Developer</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        <div className={styles.container} style={{ height: "74vh", display: "flex", justifyContent: "center", alignItems: "flex-end", paddingBottom: "64px" }}>
          <GlitchText title="Full Stack Developer" />
        </div>

        <div className="container">
          <div className={styles.gridSection}>
            <div></div>
            <div>
              <MultiColorText textOne={"Hi, I am"} textTwo={"Adarsh M."} colorOne={"#020202"} colorTwo={"#3048a5"} fontSize={"30px"} />
              <p style={{ color: "#898989", fontSize: "14px" }}>I am a UI/Web Developer and a blogger. I like to code and the tech I love are JavaScript, ReactJS, NodeJS, ExpressJS, MongoDB, GraphQL, and more. I am a self-taught developer and I am always learning new things. It&apos;s more like there are many things to learn.</p>
            </div>
          </div>
        </div>
        <FloatingButton link={ResumeLink} text={"Download Resume"} bottom={"10px"} left={"10px"} />
      </Layout>
    </div>
  )
}

export default Home
