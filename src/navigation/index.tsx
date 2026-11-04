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
import AdminSecurity from "../pages/dasboard/security";
import AdminProfile from "../pages/dasboard/profile";
import AdminSettings from "../pages/dasboard/settings";
import AdminPaymentMethods from "../pages/dasboard/payment";
import AdminSupport from "../pages/dasboard/support";

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
  {
    element: (
      <RequireAuth>
        <AdminSecurity />
      </RequireAuth>
    ),
    path: SCREENS.SECURITY,
  },
  {
    element: (
      <RequireAuth>
        <AdminProfile />
      </RequireAuth>
    ),
    path: SCREENS.PROFILE,
  },
  {
    element: (
      <RequireAuth>
        <AdminSettings />
      </RequireAuth>
    ),
    path: SCREENS.SETTINGS,
  },
  {
    element: (
      <RequireAuth>
        <AdminPaymentMethods />
      </RequireAuth>
    ),
    path: SCREENS.CARDS,
  },
  {
    element: (
      <RequireAuth>
        <AdminSupport />
      </RequireAuth>
    ),
    path: SCREENS.SUPPORT,
  },
]);

export default router;
