import Image from "next/image";
import Logo from "./Logo";

export default function Header() {
  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md h-[120px] sm:h-[140px]">
      <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6">
        <div className="decorative-line mb-4"></div>
        <div className="flex items-center justify-center gap-2 sm:gap-4 pl-8">
          <Logo />
          <h1 className="title-gradient text-3xl md:text-5xl lg:text-6xl font-display font-bold text-center tracking-wider">
            Wall of Fame
          </h1>
          <div className="relative w-10 h-10 md:w-20 md:h-20">
            <Image
              src="/muj-logo.jpg"
              alt="MUJ Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
        <div className="decorative-line mt-4"></div>
      </div>
    </div>
  );
}
