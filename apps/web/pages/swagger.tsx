import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import "swagger-ui-react/swagger-ui.css";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), {
  ssr: false,
});

const SwaggerPage = () => {
  const [spec, setSpec] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/swagger")
      .then((res) => res.json())
      .then((data) => {
        setSpec(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading Swagger spec:", error);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
      <h1 style={{ textAlign: "center" }}>📜 API Documentation</h1>
      {loading ? (
        <p style={{ textAlign: "center" }}>Cargando documentación...</p>
      ) : spec ? (
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "20px",
            background: "#fff",
          }}
        >
          <SwaggerUI spec={spec} />
        </div>
      ) : (
        <p style={{ textAlign: "center", color: "red" }}>
          Error cargando la documentación.
        </p>
      )}
    </div>
  );
};

export default SwaggerPage;
