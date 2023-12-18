"use client"
import { HeaderMenu } from "@/assets/data/NavigationMenu";
import { HeaderMenuType, HeaderType } from "@/types/HeaderTypes";
import DarkModeToggle from "@/components/atoms/darkModeToggle";

export default function Header({ logo }: HeaderType) {
    return (
        <nav className="bg-white bg-gradient-to-r from-black to-midnight-green dark:bg-gradient-to-r dark:from-midnight-green dark:to-black mx-auto px-6 transition transform fixed top-0 z-10 w-full">
            <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                <a href="#" className="flex items-center space-x-3 rtl:space-x-reverse">
                    {/* <img src={logo} className="h-8" alt="logo" /> */}
                    <h1 className="text-white dark:text-white font-medium text-lg">ADARSH M</h1>
                </a>
                <div className="hidden w-full md:block md:w-auto" id="navbar-multi-level">
                    <ul className="flex flex-row gap-4 justify-between align-middle">
                        {HeaderMenu && HeaderMenu.map((item: HeaderMenuType, id: number) => {
                            return (
                                <li key={id}>
                                    <a href={item.url} className="block py-2 px-3 text-white md:p-0 dark:text-white text-sm" aria-current="page">{item.title}</a>
                                </li>
                            )
                        })}
                        <li>
                            <DarkModeToggle />
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    )
}