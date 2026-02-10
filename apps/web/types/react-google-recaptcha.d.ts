declare module "react-google-recaptcha" {
  import * as React from "react";

  export interface ReCAPTCHAProps {
    sitekey: string;
    onChange?: (token: string | null) => void;
    onErrored?: () => void;
    onExpired?: () => void;
    theme?: "light" | "dark";
    type?: "image" | "audio";
    tabindex?: number;
    size?: "compact" | "normal" | "invisible";
    badge?: "bottomright" | "bottomleft" | "inline";
    hl?: string;
    isolated?: boolean;
  }

  class ReCAPTCHA extends React.Component<ReCAPTCHAProps> {
    getValue(): string | null;
    reset(): void;
    execute(): void;
  }

  export default ReCAPTCHA;
}
