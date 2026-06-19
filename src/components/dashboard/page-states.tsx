import { type LucideIcon, AlertCircle, Inbox, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/* ─── Loading State ─── */
export function PageLoading({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <Loader2 className="size-8 text-primary animate-spin" />
      <p className="mt-4 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

/* ─── Empty State ─── */
interface PageEmptyProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
}

export function PageEmpty({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
}: PageEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 px-6 py-20 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-[#F1F5F9]">
        <Icon className="size-6 text-muted-foreground" />
      </div>
      <h3 className="mt-5 text-base font-semibold font-[family-name:var(--font-geist)] text-foreground">
        {title}
      </h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground leading-relaxed">{description}</p>
      {actionLabel && (
        <Button
          onClick={() => {
            if (actionHref) window.location.href = actionHref;
            else if (onAction) onAction();
          }}
          className="mt-6 rounded-xl"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

/* ─── Error State ─── */
interface PageErrorProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function PageError({
  title = "Something went wrong",
  message = "Failed to load data. Please try again.",
  onRetry,
}: PageErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 px-6 py-20 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10">
        <AlertCircle className="size-6 text-destructive" />
      </div>
      <h3 className="mt-5 text-base font-semibold font-[family-name:var(--font-geist)] text-foreground">
        {title}
      </h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground leading-relaxed">{message}</p>
      {onRetry && (
        <Button variant="outline" className="mt-6 rounded-xl" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

/* ─── Success State ─── */
interface PageSuccessProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function PageSuccess({ title, message, actionLabel, onAction }: PageSuccessProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50/50 px-6 py-20 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-100">
        <CheckCircle2 className="size-6 text-emerald-600" />
      </div>
      <h3 className="mt-5 text-base font-semibold font-[family-name:var(--font-geist)] text-foreground">
        {title}
      </h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground leading-relaxed">{message}</p>
      {actionLabel && onAction && (
        <Button className="mt-6 rounded-xl" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
