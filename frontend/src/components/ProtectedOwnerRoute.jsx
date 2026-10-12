
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function ProtectedOwnerRoute() {
  const location = useLocation();
  const token = localStorage.getItem("ownerToken");

  if (!token) {
    return (
      <Navigate
        to="/owner-login"
        replace
        state={{ from: location }}
      />
    );
  }

  try {
    const decoded = jwtDecode(token);

    if (!decoded.exp || decoded.exp * 1000 <= Date.now()) {
      localStorage.removeItem("ownerToken");

      return (
        <Navigate
          to="/owner-login"
          replace
          state={{ from: location }}
        />
      );
    }
  } catch {
    localStorage.removeItem("ownerToken");

    return (
      <Navigate
        to="/owner-login"
        replace
        state={{ from: location }}
      />
    );
  }

  return <Outlet />;
}

export default ProtectedOwnerRoute;