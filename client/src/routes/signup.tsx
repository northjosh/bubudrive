import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "../hooks/useAuth";
import { useSignal } from "@preact/signals";

export const Route = createFileRoute("/signup")({
  component: RouteComponent,
});

function RouteComponent() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const username = useSignal("");
  const password = useSignal("");
  const isLoading = useSignal(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    try {
      isLoading.value = true;
      const result = await signup(username.value, password.value);
      if (result) {
        navigate({ to: "/" });
      }
    } catch (e) {
      console.error(e);
    } finally {
      isLoading.value = false;
    }
  }
  return (
    <div class="signup-container">
      <form onSubmit={handleSignup}>
        <input
          type="text"
          name="username"
          id="username"
          onChange={(e) => {
            username.value = e.currentTarget.value;
          }}
        />
        <input
          type="text"
          name="password"
          id="password"
          onChange={(e) => {
            password.value = e.currentTarget.value;
          }}
        />
        <button type="submit">signup</button>
      </form>
    </div>
  );
}
