import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

import { useAuthStore } from "@/stores/authStore";

import Navigation from "./Navigation";

const Navbar = () => {
  const { userID } = useAuthStore();

  const [StoredUserID, setStoredUserID] = useState("");

  useEffect(() => {
    const storedUserID = localStorage.getItem("userUID");
    if (storedUserID) {
      setStoredUserID(storedUserID);
    }
  }, []);

  return (
    <header className="pt-12 sm:pt-16 lg:pt-20 pb-12 sm:pb-16 lg:pb-20 w-full">
      <div className="relative flex flex-wrap items-center justify-center md:justify-between px-4 sm:px-8 md:px-16">
        <nav className="flex w-full lg:hidden space-x-6 items-center justify-center mt-4">
          {userID === StoredUserID ? (
            <Link href="/dashboard">
              <button className="w-[182px] px-2  sm:px-4 py-2 sm:py-2 text-md sm:text-md font-bold rounded-full bg-white text-mediumBlue hover:bg-mediumBlue hover:text-white">
                Dashboard
              </button>
            </Link>
          ) : (
            [
              { name: "Register", link: "/login" },
              { name: "Login", link: "/login" },
            ].map((item, index) => (
              <Link href={item.link} key={index}>
                <button className=" w-[124px] px-2 sm:px-4 py-2 sm:py-2 text-md sm:text-md font-bold rounded-full bg-white text-mediumBlue hover:bg-mediumBlue hover:text-white">
                  {item.name}
                </button>
              </Link>
            ))
          )}
        </nav>
        <div className="w-full lg:w-[35%] flex items-center justify-center lg:justify-start mt-8 lg:mt-0">
          <Link href="/" title="Home">
            <Image
              src="/trackproLogoWhite.png"
              alt="Logo"
              width={350}
              height={350}
            />
          </Link>
        </div>
        <div className="hidden lg:flex items-center w-full md:w-[65%] justify-center">
          <Navigation />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
