import { useRouter } from 'next/router'

const Post = () => {
    const router = useRouter()
    const { blogId } = router.query

    return <p>Post: {blogId}</p>
}

export default Post
