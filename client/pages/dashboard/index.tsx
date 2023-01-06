import axios from "axios"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import DashboardLayout from "../../components/Layout/DashboardLayout"
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
        <DashboardLayout>
            <div className="container mx-auto">
                <h2 className="text-2xl font-medium mt-20 text-black underline">Dashboard - All Posts</h2>
                <Link href={'/dashboard/addpost'}>
                    <button className="bg-primary-color border border-1 border-primary-color py-1 px-3 rounded text-base text-dark hover:text-white hover:bg-slate-500">Add post</button>
                </Link>

                {!posts.length ?
                    <div className="flex flex-col mt-12">
                        <p>No Posts</p>
                    </div> :
                    posts?.map((item: any) => {
                        return (
                            <div key={item._id} className="my-4 flex flex-col gap-2 position-relative border-bottom border-1 py-4">
                                <Link href={`/dashboard/edit-post/${item.slug}`}><a className="text-black dark:text-white">{item.title}</a></Link>
                                <p className="text-sm text-[#6366f1]">Categories: <span className="text-sm text-[#6b7280]">{item.categories}</span></p>
                                <p className="text-sm text-[#6366f1]">Last modified date: <span className="text-sm text-[#6b7280]">{new Date(item.updatedDate).toLocaleString("en-in")}</span></p>
                                <button className="text-black text-sm dark:text-white" onClick={(e) => deletePost(item._id)}>Delete</button>
                            </div>
                        )
                    })
                }
            </div>
        </DashboardLayout>
    )
}