import axios from 'axios'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import DashboardLayout from '../../components/Layout/DashboardLayout'
import { apiDomain } from '../../config/mediaUrls'

type PostType = {
    id: any,
    title: string,
    description: string,
    author: string,
    status: string,
    updatedDate: Date,
    slug: string,
    featuredImg: string
}

export default function Post() {
    const router = useRouter()
    const { slug } = router.query
    console.log('slug', slug);

    const [post, setPost] = useState<any>([])
    // const [filterPosts, setFilterPosts] = useState([])

    useEffect(() => {
        const getPostByUser = async () => {
            var config = {
                method: 'get',
                url: `${apiDomain}/posts/getpost/${slug}`,
            };
            const post = await axios(config)

            // const publishedPosts = posts.data.filter((post: any) => post.status === 'PUBLISH')
            setPost(post.data)
            console.log(post);

            // setFilterPosts(posts)
        }
        if (slug !== "undefined") getPostByUser();
    }, [slug])

    // function searchPost(keyword: string) {
    //     if (keyword.length > 3) {
    //         setFilterPosts(posts.filter((post: Post) => post?.title?.toLowerCase().includes(keyword) || post?.slug?.toLowerCase().includes(keyword)))
    //     }
    //     if (keyword.length === 0) {
    //         setFilterPosts(posts)
    //     }
    // }

    return (
        <DashboardLayout>
            {!post ? 'Loading' :
                <div className="container blogPost mt-6 py-4">
                    <h2 className="blog-title">{post.title}</h2>
                    <img src={post.featuredImg} className="blog-featuredImg" alt={post.caption ?? post.title} />
                    <div dangerouslySetInnerHTML={{ __html: post.description }}></div>
                </div>
            }
        </DashboardLayout>
    )
}
