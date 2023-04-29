import User from "../models/User.js";

export default {
    Query: {
        me: async (root: any, args: any, context: any) => {
            try {
                const user = await User.findOne(args)
                return user;
            } catch (error) {
                console.log(error);
                throw error;
            }
        },
        getUser: async (_: any, args: any) => {
            const user = await User.findOne(args)
            return user
        },
        getAllUsers: async () => {
            const users = await User.find({})
            return users
        }
    },
    Mutation: {
        createUser: async (parent: any, args: any) => {
            const user = new User(args);
            await user.save();
            return user;
        }
    }
}