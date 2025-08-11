import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "../hooks/useAuth";
import { useSignal } from "@preact/signals";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
});

function RouteComponent() {
  const username = useSignal("");
  const password = useSignal("");
  const error = useSignal("");
  const isLoading = useSignal(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    error.value = "";
    isLoading.value = true;

    try {
      const success = await login(username.value, password.value);
      if (success) {
        navigate({ to: "/" });
      } else {
        error.value = "Login failed";
      }
    } catch (err) {
      error.value = "An error occurred";
    } finally {
      isLoading.value = false;
    }
  };

  return (
    <div class="signup-container">
      <form onSubmit={handleSubmit}>
        <h2 className="">welcome back!</h2>
        <input
          type="text"
          required 
          placeholder="Username"
          value={username}
          onChange={(e) => (username.value = e.currentTarget.value)}
        />
        <input
          type="password"
          required
          className=""
          placeholder="password"
          value={password}
          onChange={(e) => (password.value = e.currentTarget.value)}
        />

        {error && (
          <div>{error}</div>
        )}
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className=""
          >
            log in
          </button>
        </div>
        <span style={{ display: "flex", gap: 6 }}>
          Don't have an account? <Link to="/signup">Sign up</Link>
        </span>
      </form>
    </div>
  );
}
