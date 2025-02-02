import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-900 w-full p-4 flex flex-col items-center justify-center gap-4 text-white mt-20 md:mt-28 pt-10 px-8 md:px-28 bg-cover ">
      <img
        src={"/logo.png"}
        alt={"Darul Huda Logo"}
        className="object-contain h-16 w-16"
      />
      <div className="flex flex-col items-center text-center gap-5">
        <div className="flex flex-col gap-2 items-center">
          <h1 className="font-bold text-2xl md:text-3xl text-white">
            SHUHOOD APP
          </h1>
          <p className="opacity-80 md:pr-10">
            SHUHOOD APP is an attendance software made for managing students'
            attendance and check daily updates.
          </p>
          <p className="opacity-80 md:pr-10">Have a nice day❤️</p>
        </div>
      </div>

      <div className="flex items-center justify-center w-full mt-10 mb-10 md:mb-0">
        <p className="inline-flex items-center justify-center gap-1 flex-wrap">
          &copy; Copyright {
            new Date().getFullYear()
          } | SHUHOOD  | Made with{" "}
          <Heart className="text-teal-500" />
          <Link
            to="https://digitiostack.vercel.app/"
            className="text-green-500 hover:text-green-700"
            target="_blank"
          >
            DigitioStack
          </Link>
        </p>
      </div>
    </footer>
  );
}
