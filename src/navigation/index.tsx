import { createBrowserRouter } from "react-router-dom";
import CreateAccount from "../pages/auth/register";
import Login from "../pages/auth/login";
import { SCREENS } from "./constants";
import Home from "../pages/dasboard";
import { RequireAuth } from "../pages/auth/components";
import Investments from "../pages/dasboard/investments";
import CreatePackage from "../pages/dasboard/investments/create";
import UserProfilePage from "../pages/dasboard/user-profile";
import Withdrawals from "../pages/dasboard/withdrawals";
import Deposits from "../pages/dasboard/deposit";
import AdminTransactions from "../pages/dasboard/transactions";
import AdminAIStrategies from "../pages/dasboard/ai";
import AdminWallets from "../pages/dasboard/wallets";

const router = createBrowserRouter([
  {
    index: true,
    element: <CreateAccount />,
  },
  {
    element: <Login />,
    path: SCREENS.LOGIN,
  },
  {
    element: <CreateAccount />,
    path: SCREENS.REGISTER,
  },
  {
    element: (
      <RequireAuth>
        <Home />
      </RequireAuth>
    ),
    path: SCREENS.DASHBOARD,
  },
  {
    element: (
      <RequireAuth>
        <Investments />
      </RequireAuth>
    ),
    path: SCREENS.INVESTMENTS,
  },
  {
    element: (
      <RequireAuth>
        <CreatePackage />
      </RequireAuth>
    ),
    path: SCREENS.CREATE_INVESTMENT,
  },
  {
    element: (
      <RequireAuth>
        <UserProfilePage />
      </RequireAuth>
    ),
    path: SCREENS.USER_PROFILE(),
  },
  {
    element: (
      <RequireAuth>
        <Withdrawals />
      </RequireAuth>
    ),
    path: SCREENS.WITHDRAWALS,
  },
  {
    element: (
      <RequireAuth>
        <Deposits />
      </RequireAuth>
    ),
    path: SCREENS.DEPOSIT,
  },
  {
    element: (
      <RequireAuth>
        <AdminTransactions />
      </RequireAuth>
    ),
    path: SCREENS.TRANSACTIONS,
  },
  {
    element: (
      <RequireAuth>
        <AdminAIStrategies />
      </RequireAuth>
    ),
    path: SCREENS.AI_TRADER,
  },
  {
    element: (
      <RequireAuth>
        <AdminWallets />
      </RequireAuth>
    ),
    path: SCREENS.WALLETS,
  },
]);

export default router;
