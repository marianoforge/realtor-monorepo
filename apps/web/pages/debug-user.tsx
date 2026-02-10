import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useUserDataStore } from "@/stores/userDataStore";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const DebugUser = () => {
  const { userID } = useAuthStore();
  const { userData } = useUserDataStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: userDataFromQuery, isLoading } = useQuery({
    queryKey: ["userData", userID],
    queryFn: async () => {
      if (!userID) return null;
      const token = await useAuthStore.getState().getAuthToken();
      if (!token) throw new Error("User not authenticated");

      const response = await axios.get(`/api/users/${userID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: !!userID && mounted,
  });

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Usuario</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Auth Store</h2>
        <pre className="bg-gray-100 p-4 rounded">
          {JSON.stringify({ userID }, null, 2)}
        </pre>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">User Data Store</h2>
        <pre className="bg-gray-100 p-4 rounded">
          {JSON.stringify(userData, null, 2)}
        </pre>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">React Query Data</h2>
        <p>Loading: {isLoading ? "Yes" : "No"}</p>
        <pre className="bg-gray-100 p-4 rounded">
          {JSON.stringify(userDataFromQuery, null, 2)}
        </pre>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Condiciones del Modal</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>
            welcomeModalShown:{" "}
            {userDataFromQuery?.welcomeModalShown ? "true" : "false"}
          </li>
          <li>
            stripeSubscriptionId:{" "}
            {userDataFromQuery?.stripeSubscriptionId || "N/A"}
          </li>
          <li>
            En trial:{" "}
            {userDataFromQuery?.stripeSubscriptionId === "trial" ? "YES" : "NO"}
          </li>
          <li>
            Debería mostrar modal:{" "}
            {!userDataFromQuery?.welcomeModalShown &&
            userDataFromQuery?.stripeSubscriptionId === "trial"
              ? "YES"
              : "NO"}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default DebugUser;
