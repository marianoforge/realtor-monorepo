import Link from "next/link";
import { useState, useEffect } from "react";

import { useAuthStore } from "@/stores/authStore";

import LicensesModal from "../LicensesModal";

const Navigation = () => {
  const { userID } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [StoredUserID, setStoredUserID] = useState("");

  useEffect(() => {
    const storedUserID = localStorage.getItem("userUID");
    if (storedUserID) {
      setStoredUserID(storedUserID);
    }
  }, []);

  const openModal = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="w-full flex flex-col sm:flex-row justify-between">
      <nav className="flex w-full sm:w-[50%] lg:w-full md:flex space-x-2 sm:space-x-4 items-center justify-end">
        {userID === StoredUserID ? (
          <Link href="/dashboard">
            <button className="px-2 sm:px-4 py-2 sm:py-2 text-md sm:text-md font-bold rounded-full bg-white text-mediumBlue hover:bg-mediumBlue hover:text-white">
              Dashboard
            </button>
          </Link>
        ) : (
          [
            { name: "Register", link: "#", onClick: openModal },
            { name: "Login", link: "/login" },
          ].map((item, index) => (
            <Link href={item.link} key={index}>
              <button
                className="w-[124px] px-2 sm:px-4 py-2 sm:py-2 text-md sm:text-md font-bold rounded-full bg-white text-mediumBlue hover:bg-mediumBlue hover:text-white"
                onClick={item.onClick}
              >
                {item.name}
              </button>
            </Link>
          ))
        )}
      </nav>
      {isModalOpen && (
        <LicensesModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Navigation;
