import Form from  "./component/Form";
import { Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

export default function FormPage() {
  
  const { userLoggedIn } = useAuth();

  return (
    <>
      {!userLoggedIn && <Navigate to="/login" replace={true} />}
      <Form />
    </>
  );
}
