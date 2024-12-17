import Link from "next/link";
import { Flex } from "antd";
import ButtonContained from "@/components/Button/ButtonContained";

export default function NotFound() {
  return (
    <Flex className="pt-14" justify="center" align="center" vertical>
      <h1 className="text-white-neutral text-6xl font-bold mb-4">404</h1>
      <h2 className="text-white-neutral text-3xl font-semibold mb-6">Page Not Found</h2>
      <p className="text-gray-400 text-lg mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link href="/" passHref>
        <ButtonContained>Return to Home</ButtonContained>
      </Link>
    </Flex>
  );
}
