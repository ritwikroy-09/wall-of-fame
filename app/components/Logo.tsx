import Image from "next/image";

export default function Logo() {
  return (
    <div className="relative  w-10 h-10 md:w-20 md:h-20">
      <Image
        src="/logo.png"
        alt="Wall of Fame Logo"
        fill
        className="object-contain"
        priority
      />
    </div>
  );
}
