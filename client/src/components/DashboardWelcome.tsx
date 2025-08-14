
import { useAuth } from "../hooks/useAuth";
  
export function DashboardWelcome() {
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "good morning";
    if (hour < 17) return "good afternoon";
    return "good evening";
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h4 className="text-2xl font-semibold text-foreground">
          {getGreeting()}, {user?.username}!
        </h4>
        <p className="text-sm text-muted-foreground">
        your cloud storage dashboard
        </p>
      </div>
    </div>
  );
}
