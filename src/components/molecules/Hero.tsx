import Link from "next/link"
import { FaArrowRight, FaArrowRightArrowLeft, FaDownload, FaFilePdf, FaReact } from "react-icons/fa6"
import TechStack from "./TechStack"

export default function Hero() {
    return (
        <section className="bg-[url('../assets/images/hero_bg_img.png')] dark:bg-[url('../assets/images/hero_bg_light.png')] transform transition-all delay-100 bg-cover w-full py-2 md:py-4 lg:py-6 xl:py-8 min-h-screen flex justify-center align-middle">
            <div className="container px-4 md:px-6 my-auto">
                {/* <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Looking for a Developer? Hire Now!</span> */}
                <p className="group -my-2 hidden items-center gap-2 rounded-full bg-white/25 px-3 py-2 text-xs text-slate-100 ring-1 ring-inset ring-black/[0.08] hover:bg-white/50 hover:ring-black/[0.13] sm:flex lg:hidden xl:flex w-max">
                    Looking for a Developer?
                    <span className="group-hover:translate-x-1 transition-transform font-semibold underline underline-offset-4">
                        You're Lucky!
                    </span>
                </p>
                <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 text-center md:text-left mt-6">
                    <div className="md:w-1/2">
                        <h1 className="text-white text-6xl font-thin tracking-tighter sm:text-6xl md:text-6xl lg:text-7xl">
                            Adarsh M
                        </h1>
                        <br />
                        <p className="mx-auto md:mx-0 max-w-[700px] text-gray-500 text-sm dark:text-gray-400 italic">
                            {/* I am a passionate web developer with a passion for creating visually appealing and user-friendly web applications. I am a quick learner and collaborate closely with clients to create efficient, user-friendly solutions that meet their needs. */}
                            {/* <br /> <br /> */}
                            I am excited to contribute my skills to the web development industry and look forward to working with you to create a seamless and enjoyable user experience.
                        </p>
                        <div className="mt-8">
                            <Link
                                className="flex w-fit rounded-full px-6 py-3 text-sm bg-teal-700 text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300"
                                // inline-flex h-9 items-center justify-center rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300
                                href="#"
                            >
                                <p className="flex w-fit gap-2 items-center">
                                    Download Resume
                                    <span className="">
                                        <FaArrowRight />
                                    </span>
                                </p>
                            </Link>
                        </div>
                    </div>
                    <div className="md:w-1/2"></div>
                </div>

                {/* <div className="mt-4">
                    <TechStack />
                </div> */}
            </div>
        </section>
    )
}

