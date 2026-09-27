import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BellOff, CheckCheck, Trash2 } from "lucide-react";
import type { NotificationCategory } from "@/types";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { ChipRow, FilterChip } from "@/components/common/FilterChip";
import { EmptyState } from "@/components/common/EmptyState";
import { NotificationItem } from "@/components/cards/NotificationItem";
import { IconButton } from "@/components/common/Button";
import { useData, useUI } from "@/hooks/useApp";
import { useNotifications } from "@/hooks/useBusiness";
import { NOTIFICATION_CATEGORIES } from "@/data/notifications";

type Filter = "All" | "Unread" | NotificationCategory;

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { markNotificationRead, markAllNotificationsRead, clearReadNotifications } = useData();
  const { toast, confirm } = useUI();
  const notifications = useNotifications();
  const [filter, setFilter] = useState<Filter>("All");

  const visible = useMemo(
    () =>
      notifications.filter((n) => (filter === "All" ? true : filter === "Unread" ? !n.read : n.category === filter)),
    [notifications, filter],
  );
  const unread = notifications.filter((n) => !n.read);
  const read = notifications.filter((n) => n.read);

  return (
    <>
      <TopAppBar
        title="Notifications"
        subtitle={unread.length ? `${unread.length} unread` : "You are all caught up"}
        backTo="/home"
        right={
          <>
            <IconButton
              label="Mark all as read"
              tone="plain"
              disabled={!unread.length}
              onClick={() => {
                markAllNotificationsRead(unread.map((n) => n.id));
                toast("All notifications marked as read");
              }}
            >
              <CheckCheck className="h-5 w-5" />
            </IconButton>
            <IconButton
              label="Clear read notifications"
              tone="plain"
              disabled={!read.length}
              onClick={() =>
                confirm({
                  title: "Clear read notifications?",
                  message: `${read.length} read notification${read.length > 1 ? "s" : ""} will be removed from this list.`,
                  confirmLabel: "Clear",
                  tone: "danger",
                  onConfirm: () => {
                    clearReadNotifications(read.map((n) => n.id));
                    toast("Read notifications cleared");
                  },
                })
              }
            >
              <Trash2 className="h-5 w-5" />
            </IconButton>
          </>
        }
      >
        <ChipRow className="pb-0.5">
          {(["All", "Unread", ...NOTIFICATION_CATEGORIES] as Filter[]).map((f) => (
            <FilterChip
              key={f}
              label={f}
              active={filter === f}
              onClick={() => setFilter(f)}
              count={f === "Unread" ? unread.length : f === "All" ? undefined : notifications.filter((n) => n.category === f).length || undefined}
            />
          ))}
        </ChipRow>
      </TopAppBar>

      <div className="px-5 pb-8 pt-4">
        {visible.length ? (
          <div className="card divide-y divide-surface-line overflow-hidden">
            {visible.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onClick={() => {
                  markNotificationRead(n.id);
                  if (n.link) navigate(n.link);
                }}
              />
            ))}
          </div>
        ) : (
          <EmptyState icon={BellOff} title="No notifications here" message="Growth, finance and operations updates will appear here as they happen." />
        )}
      </div>
    </>
  );
}
