import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export function ApiErrorHandler() {
  const { toast } = useToast();

  useEffect(() => {
    // Handle unhandled promise rejections (API errors)
    const handleRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;
      const message =
        error?.message || error?.toString() || "An unknown error occurred";

      console.error("Unhandled error:", error);

      toast({
        variant: "destructive",
        title: "Error",
        description: message,
        duration: 5000,
      });
    };

    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, [toast]);

  return null;
}
