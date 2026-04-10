import { FC, useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import { NoitaLauncherService } from "../../services/noitaLauncher";

interface NoitaLauncherProps {
  className?: string;
  variant?: string;
  size?: "sm" | "lg";
}

type LaunchStatus = "idle" | "loading" | "success" | "error";

const NoitaLauncher: FC<NoitaLauncherProps> = ({ className = "", variant = "outline-danger", size = "sm" }) => {
  const [status, setStatus] = useState<LaunchStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const launcherService = new NoitaLauncherService();

  const handleLaunch = async () => {
    setStatus("loading");
    setErrorMessage("");

    try {
      const result = await launcherService.restart();

      if (result.success) {
        setStatus("success");
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        throw new Error(result.message || "Launch failed");
      }
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Unknown error occurred");
      setTimeout(() => setStatus("idle"), 5000);
    }
  };

  const getButtonContent = () => {
    switch (status) {
      case "loading":
        return (
          <>
            <Spinner animation="border" size="sm" className="me-2" />
            Launching Noita...
          </>
        );
      case "success":
        return (
          <>
            <i className="bi bi-check-circle me-2"></i>
            Launched
          </>
        );
      case "error":
        return (
          <>
            <i className="bi bi-exclamation-triangle me-2"></i>
            Error
          </>
        );
      default:
        return (
          <>
            <i className="bi bi-arrow-clockwise me-2"></i>
            Restart Noita
          </>
        );
    }
  };

  const getButtonVariant = () => {
    switch (status) {
      case "success":
        return "success";
      case "error":
        return "danger";
      default:
        return variant;
    }
  };

  return (
    <>
      <Button
        className={className}
        variant={getButtonVariant()}
        size={size}
        onClick={handleLaunch}
        disabled={status === "loading"}
      >
        {getButtonContent()}
      </Button>

      {status === "error" && errorMessage && (
        <div className="mt-2 p-2 bg-danger text-white rounded small">
          <i className="bi bi-exclamation-circle me-2"></i>
          {errorMessage}
        </div>
      )}
    </>
  );
};

export default NoitaLauncher;
