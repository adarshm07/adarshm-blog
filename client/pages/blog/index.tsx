/* eslint-disable @next/next/no-img-element */
import axios from "axios"
import Head from "next/head"
import Link from "next/link"
import React, { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import Layout from "../../components/Layout"

export default function Blog() {
    const [posts, setPosts] = useState([])
    const [filterPosts, setFilterPosts] = useState([])
    const userData = useSelector((state: any) => state.user)

    useEffect(() => {
        const getPostByUser = async () => {
            var config = {
                method: 'get',
                url: `http://localhost:4000/posts/allposts`,
            };
            const posts = await axios(config)
            const publishedPosts = posts.data.filter((post: any) => post.status === 'PUBLISH')
            setPosts(publishedPosts)
            setFilterPosts(publishedPosts)
        }
        getPostByUser();
    }, [])

    function searchPost(keyword: string) {
        if (keyword.length > 3) {
            console.log(keyword.toUpperCase());
            setFilterPosts(posts.filter((post: any) => post?.title?.toLowerCase().includes(keyword)))
        }
        if (keyword.length === 0) {
            setFilterPosts(posts)
        }
    }

    return (
        <React.Fragment>
            <Head>
                <title>Blog</title>
                <meta name="description" content="Generated by create next app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Layout>
                <div className="header-blog">
                    <h2 className="text-center">My Blog</h2>
                    <div className="d-flex justify-content-center gap-2 text-center">
                        <input type="text" placeholder="Search for blog title here..." className="p-3 border-0 rounded search-blog-posts mt-4" style={{ width: `clamp(240px, 300px, 600px)` }} onChange={(e) => searchPost(e.target.value)} />
                        {/* <span className="badge rounded-pill bg-primary">JavaScript</span>
                    <span className="badge rounded-pill bg-secondary">ReactJS</span>
                    <span className="badge rounded-pill bg-warning">NextJS</span>
                    <span className="badge rounded-pill bg-primary">VueJS</span>
                    <span className="badge rounded-pill bg-primary">NodeJS</span>
                    <span className="badge rounded-pill bg-primary">Personal</span> */}
                    </div>
                </div>
                <div className="container">
                    <div className="row">
                        <div className="blog-posts-container mt-5 col-12 col-lg-8">
                            {filterPosts?.map((post: any) => {
                                let featuredImg = post.description?.match(/(?<=<img src=").*?(?=")/gm);
                                return (
                                    <div className="col-12 p-3" style={{ boxShadow: "6px 0px 16px #f4f4f4" }} key={post._id}>
                                        <div className="d-flex flex-column gap-3">
                                            <img src={featuredImg} className="card-img-top" alt={post.title} style={{ width: "auto", height: `clamp(200px, 240px, 400px)` }} />
                                            <div className="card-body position-relative">
                                                <h5 className="card-title">{post.title}</h5>
                                                <div className="d-flex">
                                                    <p className="card-text">{new Date(post.updatedDate).toLocaleDateString('en-IN')}</p> &nbsp;
                                                    <p className="card-text">by</p> &nbsp;
                                                    <p className="card-text">{post.author[0].name}</p>
                                                </div>
                                                <p className="card-text">{post.metaDescription}</p>
                                                <Link href={`/dashboard/edit-post/${post.slug}`}>
                                                    <a className="btn-read-more">
                                                        Read More
                                                    </a>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="col-12 col-lg-4 mt-5 ml-auto border border-0 rounded" style={{ boxShadow: "6px 0px 16px #f4f4f4", width: `clamp(300px, 400px, 500px)` }}>

                        </div>
                    </div>
                </div>
            </Layout >
        </React.Fragment>
    )
}