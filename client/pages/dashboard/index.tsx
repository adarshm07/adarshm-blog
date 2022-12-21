import axios from "axios"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import Layout from "../../components/Layout"
import { apiDomain } from "../../config/mediaUrls"

export default function Dashboard() {
    const [posts, setPosts] = useState([])
    const userData = useSelector((state: any) => state.user)

    useEffect(() => {
        const getPostByUser = async () => {
            var config = {
                method: 'get',
                url: `${apiDomain}/posts/my-posts/${userData.user._id}`,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userData.user.token}`
                },
            };
            const posts = await axios(config)
            setPosts(posts.data)

        }
        getPostByUser();

    }, [userData.user._id, userData.user.token])

    const deletePost = (id: any) => {
        var config = {
            method: 'delete',
            url: `${apiDomain}/posts/delete/${id}`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userData.user.token}`
            },
        };
        axios(config)
            .then((res) => {
                setPosts(posts.filter((item: any) => item._id !== id))
            })
            .catch((err: Error) => { throw new Error })
    }
    return (
        <Layout>
            <div className="container">
                <h2 style={{ marginTop: "6rem" }}>Dashboard - All Posts</h2>
                <Link href={'/dashboard/addpost'}>
                    <button className="btn btn-secondary rounded-pill px-4 py-1 mt-4 d-flex ms-auto">Add post</button>
                </Link>

                {posts?.map((item: any) => {
                    return (
                        <div key={item._id} className="my-4 d-flex flex-column gap-2 position-relative border-bottom border-1 p-4">
                            <Link href={`/dashboard/edit-post/${item.slug}`}><a className="fs-5 fw-bold">{item.title}</a></Link>
                            <span>Categories: {item.categories}</span>
                            <span>Last modified date: {new Date(item.updatedDate).toLocaleString("en-in")}</span>
                            {/* <div dangerouslySetInnerHTML={{ __html: item.description }}></div> */}
                            <button className="btn btn-link text-secondary p-0 position-absolute end-0" onClick={(e) => deletePost(item._id)}>Delete</button>
                        </div>
                    )
                })}
            </div>
        </Layout>
    )
}