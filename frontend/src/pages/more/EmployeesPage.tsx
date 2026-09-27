import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Clock, LogIn, LogOut, Plus, ShieldCheck, UserPlus, UserRoundX } from "lucide-react";
import type { Employee, EmployeeRole } from "@/types";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { IconButton, Button } from "@/components/common/Button";
import { ChipRow, FilterChip, Segmented } from "@/components/common/FilterChip";
import { SelectField, TextField, Toggle } from "@/components/common/Form";
import { BottomSheet } from "@/components/common/Overlay";
import { Avatar } from "@/components/common/Brand";
import { StatusBadge } from "@/components/common/StatusBadge";
import { InfoRow } from "@/components/cards/ListRow";
import { useData, useUI } from "@/hooks/useApp";
import { ALL_PERMISSIONS, rolePermissions } from "@/data/employees";
import { ACTIVE_OUTLET_IDS, outletArea } from "@/data/outlets";
import { DEMO_NOW, DEMO_TODAY } from "@/data/merchant";
import { isCountedSale, netAmount } from "@/data/analytics";
import { formatCompactRupiah, initials } from "@/utils/format";

const SHIFTS = [
  { label: "Morning", start: "06:45", end: "15:00" },
  { label: "Afternoon", start: "13:00", end: "22:00" },
  { label: "Evening", start: "15:00", end: "22:00" },
  { label: "Flexible", start: "09:00", end: "17:00" },
];

const nowTime = () => {
  const d = new Date();
  const real = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return real > DEMO_NOW ? real : DEMO_NOW;
};

export default function EmployeesPage() {
  const [params] = useSearchParams();
  const { employees, saveEmployee, allTransactions } = useData();
  const { toast, confirm } = useUI();
  const [outlet, setOutlet] = useState<string>("all");
  const [openId, setOpenId] = useState<string | null>(params.get("id"));
  const [addOpen, setAddOpen] = useState(false);
  const [draft, setDraft] = useState({ name: "", phone: "", role: "Cashier" as EmployeeRole, outletId: ACTIVE_OUTLET_IDS[0], shift: "Morning" });

  useEffect(() => {
    if (params.get("id")) setOpenId(params.get("id"));
  }, [params]);

  const todayStats = useMemo(() => {
    const map = new Map<string, { count: number; amount: number }>();
    ACTIVE_OUTLET_IDS.forEach((id) =>
      (allTransactions[id] ?? [])
        .filter((t) => t.date === DEMO_TODAY && isCountedSale(t))
        .forEach((t) => {
          const key = `${id}:${t.cashier}`;
          const entry = map.get(key) ?? { count: 0, amount: 0 };
          entry.count += 1;
          entry.amount += netAmount(t);
          map.set(key, entry);
        }),
    );
    return map;
  }, [allTransactions]);

  const visible = employees.filter((e) => outlet === "all" || e.outletId === outlet);
  const open = employees.find((e) => e.id === openId) ?? null;
  const statsFor = (e: Employee) => todayStats.get(`${e.outletId}:${e.name.split(" ")[0]}`) ?? todayStats.get(`${e.outletId}:${e.name}`) ?? { count: 0, amount: 0 };

  const setRole = (e: Employee, role: EmployeeRole) =>
    confirm({
      title: `Change ${e.name}'s role to ${role}?`,
      message: `${role} permissions: ${rolePermissions[role].permissions.join(", ")}.`,
      confirmLabel: "Change role",
      onConfirm: () => {
        saveEmployee({ ...e, role, permissions: rolePermissions[role].permissions });
        toast(`${e.name} is now ${role}`);
      },
    });

  return (
    <>
      <TopAppBar
        title="Staff"
        subtitle={`${employees.filter((e) => e.active).length} active · ${employees.filter((e) => e.attendance.status === "Clocked In").length} on shift`}
        right={
          <IconButton label="Add staff" onClick={() => setAddOpen(true)}>
            <Plus className="h-5 w-5" />
          </IconButton>
        }
      >
        <ChipRow>
          <FilterChip label="All outlets" active={outlet === "all"} onClick={() => setOutlet("all")} />
          {ACTIVE_OUTLET_IDS.map((id) => (
            <FilterChip key={id} label={outletArea(id)} active={outlet === id} onClick={() => setOutlet(id)} />
          ))}
        </ChipRow>
      </TopAppBar>

      <div className="space-y-3 px-5 pb-8 pt-4">
        {visible.map((e) => {
          const s = statsFor(e);
          return (
            <button key={e.id} type="button" onClick={() => setOpenId(e.id)} className="card block w-full p-4 text-left transition hover:shadow-float">
              <div className="flex items-center gap-3">
                <Avatar initials={initials(e.name)} size={44} tone={e.active ? "soft" : "sky"} />
                <div className="min-w-0 flex-1">
                  <p className="text-[14.5px] font-bold text-ink">{e.name}</p>
                  <p className="text-[12px] text-ink-muted">
                    {e.role} · {outletArea(e.outletId)}
                  </p>
                </div>
                <StatusBadge
                  status={!e.active ? "Inactive" : e.attendance.status}
                  tone={!e.active ? "neutral" : e.attendance.status === "Clocked In" ? "success" : e.attendance.status === "Off" ? "neutral" : "info"}
                />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-surface p-2.5 text-center">
                <div>
                  <p className="text-[10.5px] text-ink-muted">Shift</p>
                  <p className="text-[12px] font-bold text-ink">
                    {e.shift.start}–{e.shift.end}
                  </p>
                </div>
                <div>
                  <p className="text-[10.5px] text-ink-muted">Today</p>
                  <p className="text-[12px] font-bold text-ink">{s.count} transactions</p>
                </div>
                <div>
                  <p className="text-[10.5px] text-ink-muted">Handled</p>
                  <p className="text-[12px] font-bold text-ink">{formatCompactRupiah(s.amount)}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <BottomSheet open={!!open} onClose={() => setOpenId(null)} title={open?.name ?? ""} subtitle={open ? `${open.role} · ${outletArea(open.outletId)}` : undefined}>
        {open && (
          <div className="space-y-4">
            <div className="card px-4 py-2">
              <InfoRow label="Status" value={open.active ? "Active" : "Inactive"} />
              <InfoRow label="Phone" value={open.phone} />
              <InfoRow label="Joined" value={open.joinedAt} />
              <InfoRow label="Shift" value={`${open.shift.label}, ${open.shift.start}–${open.shift.end} (${open.shift.days})`} />
              <InfoRow label="Attendance" value={open.attendance.clockIn ? `In ${open.attendance.clockIn}${open.attendance.clockOut ? ` · Out ${open.attendance.clockOut}` : ""}` : open.attendance.status} />
            </div>

            {open.active && open.role !== "Owner" && (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={open.attendance.status === "Clocked In" ? "secondary" : "primary"}
                  leftIcon={open.attendance.status === "Clocked In" ? <LogOut className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
                  onClick={() => {
                    const t = nowTime();
                    const clockingOut = open.attendance.status === "Clocked In";
                    saveEmployee({
                      ...open,
                      attendance: clockingOut ? { ...open.attendance, status: "Clocked Out", clockOut: t } : { status: "Clocked In", clockIn: t },
                    });
                    toast(`${open.name} clocked ${clockingOut ? "out" : "in"} at ${t}`);
                  }}
                >
                  {open.attendance.status === "Clocked In" ? "Clock out" : "Clock in"}
                </Button>
                <SelectField
                  label=""
                  aria-label="Shift"
                  value={open.shift.label}
                  onChange={(ev) => {
                    const s = SHIFTS.find((x) => x.label === ev.target.value)!;
                    saveEmployee({ ...open, shift: { ...open.shift, ...s } });
                    toast(`Shift changed to ${s.label}`);
                  }}
                  options={SHIFTS.map((s) => ({ value: s.label, label: `${s.label} ${s.start}` }))}
                  className="[&>span]:hidden"
                />
              </div>
            )}

            {open.role !== "Owner" && (
              <section>
                <p className="mb-2 text-[13px] font-bold text-ink">Role</p>
                <Segmented<EmployeeRole>
                  value={open.role}
                  onChange={(r) => r !== open.role && setRole(open, r)}
                  options={[
                    { value: "Cashier", label: "Cashier" },
                    { value: "Manager", label: "Manager" },
                    { value: "Owner", label: "Owner" },
                  ]}
                />
                <p className="mt-2 text-[12px] text-ink-muted">{rolePermissions[open.role].summary}</p>
              </section>
            )}

            <section>
              <p className="mb-1 flex items-center gap-1.5 text-[13px] font-bold text-ink">
                <ShieldCheck className="h-4 w-4 text-navy" /> Permission settings
              </p>
              <div className="rounded-2xl bg-surface px-3">
                {ALL_PERMISSIONS.map((perm) => (
                  <Toggle
                    key={perm}
                    label={perm}
                    checked={open.permissions.includes(perm)}
                    disabled={open.role === "Owner"}
                    onChange={(v) => saveEmployee({ ...open, permissions: v ? [...open.permissions, perm] : open.permissions.filter((p) => p !== perm) })}
                  />
                ))}
              </div>
            </section>

            {open.role !== "Owner" && (
              <Button
                block
                variant={open.active ? "secondary" : "primary"}
                leftIcon={open.active ? <UserRoundX className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                className={open.active ? "text-danger" : ""}
                onClick={() =>
                  confirm({
                    title: open.active ? `Deactivate ${open.name}?` : `Reactivate ${open.name}?`,
                    message: open.active ? "They will no longer be able to log in to the cashier." : "They will be able to log in again with their current role.",
                    confirmLabel: open.active ? "Deactivate" : "Reactivate",
                    tone: open.active ? "danger" : "default",
                    onConfirm: () => {
                      saveEmployee({ ...open, active: !open.active, attendance: open.active ? { status: "Off" } : { status: "Not Started" } });
                      toast(`${open.name} ${open.active ? "deactivated" : "reactivated"}`);
                    },
                  })
                }
              >
                {open.active ? "Deactivate staff" : "Reactivate staff"}
              </Button>
            )}
          </div>
        )}
      </BottomSheet>

      <BottomSheet
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add staff"
        footer={
          <Button
            block
            size="lg"
            disabled={draft.name.trim().length < 2 || draft.phone.replace(/\D/g, "").length < 9}
            onClick={() => {
              const shift = SHIFTS.find((s) => s.label === draft.shift)!;
              saveEmployee({
                id: `e-${Date.now()}`,
                name: draft.name.trim(),
                role: draft.role,
                outletId: draft.outletId,
                active: true,
                phone: draft.phone,
                joinedAt: "Sep 2026",
                shift: { ...shift, days: "Mon - Sat" },
                attendance: { status: "Not Started" },
                permissions: rolePermissions[draft.role].permissions,
              });
              toast(`${draft.name.trim()} added. An invite was sent by SMS.`);
              setDraft({ name: "", phone: "", role: "Cashier", outletId: ACTIVE_OUTLET_IDS[0], shift: "Morning" });
              setAddOpen(false);
            }}
          >
            Add and send invite
          </Button>
        }
      >
        <div className="space-y-3">
          <TextField label="Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} maxLength={30} />
          <TextField label="Phone number" inputMode="tel" placeholder="+62 8xx" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value.replace(/[^\d+\s-]/g, "") })} />
          <SelectField label="Role" value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value as EmployeeRole })} options={(["Cashier", "Manager"] as EmployeeRole[]).map((r) => ({ value: r, label: r }))} />
          <SelectField label="Outlet" value={draft.outletId} onChange={(e) => setDraft({ ...draft, outletId: e.target.value })} options={ACTIVE_OUTLET_IDS.map((id) => ({ value: id, label: outletArea(id) }))} />
          <SelectField label="Shift" value={draft.shift} onChange={(e) => setDraft({ ...draft, shift: e.target.value })} options={SHIFTS.map((s) => ({ value: s.label, label: `${s.label} (${s.start}–${s.end})` }))} />
          <p className="flex items-center gap-1.5 text-[12px] text-ink-muted">
            <Clock className="h-3.5 w-3.5" /> Permissions follow the role and can be adjusted later.
          </p>
        </div>
      </BottomSheet>
    </>
  );
}
