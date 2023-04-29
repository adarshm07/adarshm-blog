import mongoose from "mongoose"

// connect with mongodb
export default function connect() {
    mongoose.connect(process.env.DB_URL).then(() => {
        console.log("Connected to MongoDB")
    }
    ).catch((err) => {
        console.log("Error connecting to MongoDB", err)
    })
}