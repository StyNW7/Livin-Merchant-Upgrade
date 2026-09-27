import { useNavigate } from "react-router-dom";
import { Compass } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/common/Button";
import { useSession } from "@/hooks/useApp";

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { mode } = useSession();
  return (
    <div className="flex flex-1 items-center justify-center bg-surface">
      <EmptyState
        icon={Compass}
        title="Page not found"
        message="The page you are looking for does not exist or has moved."
        action={<Button onClick={() => navigate(mode === "none" ? "/welcome" : "/home", { replace: true })}>Back to Home</Button>}
      />
    </div>
  );
}
