import HeroSection from "../HeroSections";

import Navbar from "./Navbar";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div className="relative w-full">
        <div className="absolute inset-2 bottom-0 rounded-xl ring-1 ring-black/5 bg-gradient-to-r from-lightBlue via-mediumBlue to-darkBlue"></div>
        <div className="relative flex flex-col justify-center items-center w-full px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32 2xl:px-48">
          <Navbar />
          <HeroSection />
        </div>
      </div>
      <main className="flex flex-col justify-center items-center">
        {children}
      </main>
    </>
  );
};

export default MainLayout;
