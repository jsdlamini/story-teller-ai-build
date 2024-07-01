import Image from "next/image";
import Logo from "../images/Logo.jpeg";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import StoryWriter from "@/Components/StoryWriter";

export default function Home() {
  return (
    <main className="">
      <section className="flex-1 grid grid-cols-1 lg:grid-cols-2">
        <div className="bg-purple-500 flex flex-col space-y-5 justify-center items-center order-1 lg:-order-1 pb-10">
          <Image src={Logo} height={250} alt="Logo" />
          <Button asChild className="px-20 bg-purple-700 p-10 text-xl">
            <Link href={"/stories"}>Explore Story Library </Link>
          </Button>
        </div>
        {/* Story writer */}
        <StoryWriter />
      </section>
    </main>
  );
}
