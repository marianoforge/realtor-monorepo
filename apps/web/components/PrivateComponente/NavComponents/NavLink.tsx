import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";

interface NavLinkProps {
  href?: string;
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  target?: string;
}

export const NavLink: React.FC<NavLinkProps> = ({
  href = "/default-path",
  label,
  icon,
  target,
}) => {
  const router = useRouter();
  const isActive = router.pathname === href;

  return (
    <Link
      href={href}
      className={`group flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
        isActive
          ? "bg-mediumBlue/10 text-mediumBlue"
          : "text-gray-700 hover:bg-lightBlue/10 hover:text-mediumBlue"
      }`}
      target={target}
    >
      <span
        className={`transition-colors duration-200 ${
          isActive
            ? "text-mediumBlue"
            : "text-gray-400 group-hover:text-mediumBlue"
        }`}
      >
        {icon}
      </span>
      <span>{label}</span>
    </Link>
  );
};
