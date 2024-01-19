import { Post } from "../models/Post.model"

export default {
    Query: {
        getAllPosts: async (root: any, args: any, context: any) => {
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
        createPost: async (root: any, args: any) => {
            try {
                const postExists: any = await Post.findOne({ slug: args.slug })
                if (postExists) throw new Error("Slug already exists.");
                // const post = new Post(args);
                // console.log(post);

                const res = await Post.create(args);
                return res;
                return;
            } catch (error: any) {
                console.log(error);
                return new Error(error)
            }
        }
    }
}