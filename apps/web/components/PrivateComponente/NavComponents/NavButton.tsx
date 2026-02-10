import Link from "next/link";
import { useRouter } from "next/router";

interface NavLinkProps {
  href?: string;
  label: string;
  fullWidth?: boolean;
  onClick?: () => void;
  className?: string;
}

export const NavButton: React.FC<NavLinkProps> = ({
  href,
  label,
  fullWidth = false,
  onClick,
  className,
}) => {
  const router = useRouter();
  const isActive = router.pathname === href;

  return (
    <Link
      href={href || ""}
      className={`text-white px-3 py-2 rounded transition duration-150 ease-in-out ${
        fullWidth ? "w-full text-center" : ""
      } ${className} ${isActive ? "bg-lightBlue/15" : "hover:text-mediumBlue"}`}
      onClick={onClick}
    >
      {label}
    </Link>
  );
};
