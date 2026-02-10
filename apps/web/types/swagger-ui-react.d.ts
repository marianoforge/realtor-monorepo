declare module "swagger-ui-react" {
  import * as React from "react";

  export interface SwaggerUIProps {
    spec?: any;
    url?: string;
    onComplete?: (system: any) => void;
    requestInterceptor?: (req: any) => any;
    responseInterceptor?: (res: any) => any;
    docExpansion?: "none" | "list" | "full";
    deepLinking?: boolean;
    displayOperationId?: boolean;
    defaultModelsExpandDepth?: number;
    defaultModelExpandDepth?: number;
    displayRequestDuration?: boolean;
    tryItOutEnabled?: boolean;
    supportedSubmitMethods?: string[];
    validatorUrl?: string | null;
    dom_id?: string;
    plugins?: any[];
    presets?: any[];
    layout?: string;
    showExtensions?: boolean;
    showCommonExtensions?: boolean;
    filter?: string | boolean;
    syntaxHighlight?: { activated?: boolean; theme?: string };
    persistAuthorization?: boolean;
    withCredentials?: boolean;
    oauth2RedirectUrl?: string;
    requestSnippetsEnabled?: boolean;
    requestSnippets?: {
      generators?: any;
      defaultExpanded?: boolean;
      languages?: string[];
    };
    onSwaggerUiLoaded?: (system: any) => void;
  }

  class SwaggerUI extends React.Component<SwaggerUIProps> {}

  export default SwaggerUI;
}
