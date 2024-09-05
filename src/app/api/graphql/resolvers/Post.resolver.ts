import { Post } from "../models/Post.model"

export default {
    Query: {
        getAllPosts: async () => {
            try {
                const posts = await Post.find();
                if (!posts) throw new Error("No users found");
                return posts;
            } catch (error) {
                throw new Error("Error.");
            }
        }
    },
    Mutation: {
        createPost: async (_root: any, args: any) => {
            try {
                const postExists: any = await Post.findOne({ slug: args.slug })
                if (postExists) throw new Error("Slug already exists.");
                const post = new Post(args);
                const res = await post.save();
                return res;
            } catch (error: any) {
                return new Error(error)
            }
        },
        deletePost: async (_: any, args: any) => {
            // console.log(args);
            try {
                // if (args._id) {
                //     const post = await Post.findByIdAndDelete(args.id);
                //     if (!post) throw new Error("Post not found.");
                //     return post;
                // } else {
                const { _id, slug } = args;
                console.log(_id, slug);

                const arg = _id !== undefined ? { _id } : { slug };
                const post = await Post.findOneAndDelete(arg);
                if (!post) throw new Error("Post not found.");
                return post;
                // }
            } catch (error: any) {
                return new Error(error)
            }
        }
    }
}