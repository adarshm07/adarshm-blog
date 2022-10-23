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
            setPosts(posts.data)
        }
        getPostByUser();

        const findAllImageUrl = () => {
            // const images = await posts[1]?.description?.match(/(?<=<img src=").*?(?=")/gm);
            // console.log(images);
            // loop through posts
            // find all images in each post and push it to an array [title: {img1: '', img2: ''}]
            // pass this to previewImage(images)

            posts.forEach((post: any) => {
                console.log('images', post?.description?.match(/(?<=<img src=").*?(?=")/gm));

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

    return (
        <Layout>
            <div className="header-blog">
                <h2 className="text-center">Blog</h2>
            </div>
            <div className="container">
                {posts?.map((item: any) => {
                    return (
                        <div key={item._id}>
                            <div className="card" style={{ width: "18rem" }}>
                                <img src="" className="card-img-top" alt="..." />
                                <div className="card-body">
                                    <h5 className="card-title">{item.title}</h5>
                                    <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                                    <a href="#" className="btn btn-link">Read More</a>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </Layout >
    )
}