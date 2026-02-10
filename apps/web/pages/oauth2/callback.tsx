import { useEffect } from "react";

/**
 * OAuth2 callback page for Google Calendar integration
 * This page is shown briefly when the OAuth popup closes
 */
export default function OAuthCallback() {
  useEffect(() => {
    // Close the popup window after OAuth flow completes
    if (window.opener) {
      window.close();
    } else {
      // If not in popup, redirect to dashboard
      window.location.href = "/dashboard";
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Conectando Google Calendar...
        </h2>
        <p className="text-gray-600">
          Cerrando ventana y volviendo a la aplicación...
        </p>
      </div>
    </div>
  );
}
