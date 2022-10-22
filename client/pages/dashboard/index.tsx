import axios from "axios"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import Layout from "../../components/Layout"

export default function Dashboard() {
    const [posts, setPosts] = useState([])
    const userData = useSelector((state: any) => state.user)

    useEffect(() => {
        const getPostByUser = async () => {
            var config = {
                method: 'get',
                url: `http://localhost:4000/posts/my-posts/${userData.user._id}`,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userData.user.token}`
                },
            };
            const posts = await axios(config)
            setPosts(posts.data)
            // console.log(posts.data);

        }
        getPostByUser();

        const findAllImageUrl = () => {
            // const images = await posts[1]?.description?.match(/(?<=<img src=").*?(?=")/gm);
            // console.log(images);
            // loop through posts
            // find all images in each post and push it to an array [title: {img1: '', img2: ''}]
            // pass this to previewImage(images)

            posts.forEach((post: any) => {
                console.log('images',post?.description?.match(/(?<=<img src=").*?(?=")/gm));

            })

        }

        function previewImage(res: any) {
            const configImagePreview = {
                method: 'post',
                url: 'http://localhost:4000/auth/previewUrl',
                data: {
                    fileName: file.name,
                    fileType: file.type
                }
            }
            axios(configImagePreview)
                .then((res: any) => {
                    console.log('previiew ', res.data.previewUrl)
                })
                .catch(() => { throw new Error('Upload failed') });
        }

        findAllImageUrl()
    }, [])

    const deletePost = (id: any) => {
        var config = {
            method: 'delete',
            url: `http://localhost:4000/posts/delete/${id}`,
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
                <h2>Dashboard</h2>
                <Link href={'/dashboard/addpost'}>Add post</Link>
                {posts?.map((item: any) => {
                    return (
                        <div key={item._id}>
                            <p>{item.title}</p>
                            <div dangerouslySetInnerHTML={{ __html: item.description }}></div>
                            <button onClick={(e) => deletePost(item._id)}>Delete</button>
                        </div>
                    )
                })}
            </div>
        </Layout>
    )
}