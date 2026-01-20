import { ReactNode, Component, ErrorInfo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
          <Card className="w-full max-w-md border-red-200 bg-white shadow-lg">
            <CardHeader className="bg-red-50 border-b border-red-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <CardTitle className="text-red-900">Something Went Wrong</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="mb-4">
                <p className="text-sm text-slate-600 mb-2">Error Details:</p>
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <p className="text-sm font-mono text-red-700 break-words">
                    {this.state.error?.message || "Unknown error occurred"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={this.resetError}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Try Again
                </Button>
                <Button
                  onClick={() => (window.location.href = "/")}
                  variant="outline"
                  className="flex-1"
                >
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
