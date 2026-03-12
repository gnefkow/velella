import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("[ErrorBoundary] Caught error:", error)
    console.error("[ErrorBoundary] Component stack:", errorInfo.componentStack)
    this.setState({ errorInfo })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div style={{ padding: "1rem", fontFamily: "system-ui", color: "#fff", background: "#1a1a1a" }}>
          <h2 style={{ marginTop: 0 }}>Something went wrong</h2>
          <pre style={{ overflow: "auto", fontSize: "12px" }}>
            {this.state.error.toString()}
          </pre>
          {this.state.errorInfo?.componentStack && (
            <details style={{ marginTop: "1rem" }}>
              <summary>Component stack</summary>
              <pre style={{ overflow: "auto", fontSize: "11px", whiteSpace: "pre-wrap" }}>
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      )
    }
    return this.props.children
  }
}
