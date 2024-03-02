import { useNavigate } from "react-router-dom";
import { User } from "../Util";

const Login = () => {
  const navigate = useNavigate();
  const users: {
    [id: string]: { id: string; name: string; password: string };
  } = {
    user1: {
      id: "user1",
      name: "rahul",
      password: "rahul",
    },
    user2: {
      id: "user2",
      name: "saksham",
      password: "saksham",
    },
    user3: {
      id: "user3",
      name: "csrai",
      password: "csrai",
    },
  };

  const handleClick = (id: string) => {
    sessionStorage.setItem(User.username, users[id].name);
    sessionStorage.setItem(User.userId, users[id].id);
    sessionStorage.setItem(User.password, users[id].password);
    navigate("/home");
  };
  return (
    <div>
      <button onClick={() => handleClick("user1")}>rahul</button>
      <br />
      <button onClick={() => handleClick("user2")}>saksham</button>
      <br />
      <button onClick={() => handleClick("user3")}>csrai</button>
    </div>
  );
};

export default Login;
