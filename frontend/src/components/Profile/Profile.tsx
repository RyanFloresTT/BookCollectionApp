import { useAuth0 } from "@auth0/auth0-react";
import React from "react";

interface User {
    picture: string;
    name: string;
    email: string;
}

const Profile: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return <div>Loading ...</div>;
  }

  console.log(isAuthenticated)
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div>
      <img src={user.picture} alt={user.name} />
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
};

export default Profile;
