import PrivateLayout from "@/components/PrivateComponente/PrivateLayout";
import PrivateRoute from "@/components/PrivateComponente/PrivateRoute";
import AllMessagesPage from "@/modules/messages/AllMessagesPage";

const MessagesPage = () => {
  return (
    <PrivateRoute>
      <PrivateLayout>
        <AllMessagesPage />
      </PrivateLayout>
    </PrivateRoute>
  );
};

export default MessagesPage;
