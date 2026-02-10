import { useUserDataStore } from "@/stores/userDataStore";

export const UserAvatar = () => {
  const { userData } = useUserDataStore();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("");
  };
  const initials = userData
    ? `${getInitials(userData.firstName || "")}${getInitials(
        userData.lastName || ""
      )}`
    : "";

  return (
    <div className="w-12 font-semibold bg-lightBlue h-12 text-white rounded-full overflow-hidden flex items-center justify-center">
      {initials}
    </div>
  );
};
