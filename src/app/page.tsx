import { BlogPosts } from '@/app/components/posts'

export default function Page() {
  return (
    <section>
      <h1 className="mb-4 text-2xl font-semibold tracking-tighter">
        Hi, Welcome to my blog!
      </h1>
      <h2 className="mb-8 text-3xl font-semibold tracking-tighter">
        I am Adarsh M. &nbsp; A JavaScript developer. Kerala, India.
      </h2>
      <div className="my-8">
        <h3 className="mb-8 text-2xl font-semibold tracking-tighter border-b border-green-600 w-fit">Blog</h3>
        <BlogPosts />
      </div>
    </section>
  )
}
