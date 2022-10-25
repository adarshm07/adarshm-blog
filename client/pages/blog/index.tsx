/* eslint-disable @next/next/no-img-element */
import axios from "axios"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import Layout from "../../components/Layout"

export default function Blog() {
    const [posts, setPosts] = useState([])
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
        }
        getPostByUser();
    }, [])

    return (
        <Layout>
            <div className="header-blog">
                <h2 className="text-center">My Blog</h2>
                <div className="d-flex justify-content-center gap-2 text-center">
                    <span className="badge rounded-pill bg-primary">JavaScript</span>
                    <span className="badge rounded-pill bg-secondary">ReactJS</span>
                    <span className="badge rounded-pill bg-warning">NextJS</span>
                    <span className="badge rounded-pill bg-primary">VueJS</span>
                    <span className="badge rounded-pill bg-primary">NodeJS</span>
                    <span className="badge rounded-pill bg-primary">Personal</span>
                </div>
            </div>
            <div className="container">
                <div className="row">
                    <div className="col-10 d-flex flex-wrap gap-4">
                        {posts?.map((post: any) => {
                            let featuredImg = post.description?.match(/(?<=<img src=").*?(?=")/gm);
                            return (
                                <div className="col-4 p-0" key={post._id}>
                                    <div className="d-flex flex-column gap-3">
                                        <img src={featuredImg} className="card-img-top" alt={post.title} style={{ width: "auto", height: `clamp(200px, 240px, 400px)` }} />
                                        <div className="card-body">
                                            <h5 className="card-title">{post.title}</h5>
                                            <p className="card-text">{post.metaDescription}</p>
                                            <Link href={`/dashboard/edit-post/${post.slug}`} className="btn btn-link">Read More</Link>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </Layout >
    )
}