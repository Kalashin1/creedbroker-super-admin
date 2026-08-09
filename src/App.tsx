import { RouterProvider } from "react-router-dom";
import router from "./navigation";
import { AuthProvider } from "./context/AuthContext";
import { NotificationsProvider } from "./context/NotificationContext";
import { SettingsProvider } from "./context/SettingsContext";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <NotificationsProvider>
          <RouterProvider router={router} />
          <ToastContainer
            position="top-right"
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick={true}
            theme="dark"
            style={{
              position: "fixed",
              top: "1rem",
              right: "1rem",
              width: "auto",
              height: "auto",
              margin: 0,
              padding: 0,
              pointerEvents: "auto",
              zIndex: 9999,
            }}
            toastStyle={{
              backgroundColor: "#0f172a",
              border: "1px solid #1e293b",
              borderRadius: "12px",
              color: "#f8fafc",
              pointerEvents: "auto",
            }}
          />
        </NotificationsProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;
