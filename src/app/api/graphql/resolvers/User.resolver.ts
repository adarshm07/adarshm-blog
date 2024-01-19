import { User } from "../models/User.model"

export default {
    Query: {
        // me: async (root: any, args: any, context: any) => {
        //     try {
        //         const user = await User.findOne(args)
        //         return user;
        //     } catch (error) {
        //         console.log(error);
        //         throw error;
        //     }
        // },
        getUser: async (_root: any, args: any) => {
            const user = await User.findOne(args)
            return user
        },
        getAllUsers: async (_root: any, _args: any, _context: any) => {
            try {
                const users = await User.find();
                if (!users) throw new Error("No users found");
                return users;

            } catch (error) {
                throw new Error("Error.");
            }
        }
    },
    Mutation: {
        createUser: async (_parent: any, args: any) => {
            try {
                const userExists: any = await User.findOne({ email: args.email })
                if (userExists) throw new Error("User already exists.")

                const user = new User(args);
                const res = await user.save();
                return res;
            } catch (error: any) {
                return new Error(error)
            }
        }
    }
}