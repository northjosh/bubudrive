import React from "react";

export class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log error to service
    console.error("ErrorBoundary caught an error:", error, info);

  }

  render() {
    if (this.state.hasError) {
      // @ts-expect-error message does not exist on Error type
      return <div>Something went wrong: {this.state.error?.message}</div>;
    }
    return this.props.children;
  }
}
