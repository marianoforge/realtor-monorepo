import { motion } from "framer-motion";
import React from "react";
import Image from "next/image";

interface BounceCardProps {
  title: React.ReactNode;
  description: string;
  delay: number;
}

const BounceCard: React.FC<BounceCardProps> = ({
  title,
  description,
  delay,
}) => {
  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 3,
        ease: [0, 0.71, 0.2, 1.01],
        scale: {
          type: "spring",
          damping: 5,
          stiffness: 80,
          restDelta: 0.001,
        },
        delay: delay,
      }}
    >
      <div className="w-full flex justify-center mb-10">
        <div className="bg-white lg:w-[500px] h-[250px] sm:h-[200px] py-10 px-6 shadow-lg w-[75%] text-center rounded-xl flex flex-col md:flex-row items-center justify-center">
          <div className="icon w-[20%] hidden md:block">
            <Image
              src="/isortp.png"
              alt="Logo"
              width={200}
              height={200}
              className="w-19 h-17"
            />
          </div>
          <div className="flex flex-col justify-center w-[90%]">
            <h3>{title}</h3>
            <p>{description}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BounceCard;
