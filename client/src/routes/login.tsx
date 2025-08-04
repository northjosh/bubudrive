import { createFileRoute } from "@tanstack/react-router";
import { signal } from "@preact/signals";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
});

function RouteComponent() {
  const email = signal("");
  return (
    <div>
      <p>Login</p>
      <div class="login">
        <input
          type="email"
          onInput={(e) => (email.value = (e.target as HTMLInputElement).value)}
        />
        <button
          onClick={() => {
            console.log(email.value);
          }}
        >
          Login
        </button>
      </div>
    </div>
  );
}
