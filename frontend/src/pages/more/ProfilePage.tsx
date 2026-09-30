import { useState } from "react";
import { FilePicker, type PickedFile } from "@/components/common/FilePicker";
import { BadgeCheck, CheckCircle2, CircleDashed, FileUp, ShieldCheck, Store } from "lucide-react";
import { TopAppBar, PageBody } from "@/components/layout/TopAppBar";
import { Avatar } from "@/components/common/Brand";
import { Button } from "@/components/common/Button";
import { BottomSheet } from "@/components/common/Overlay";
import { ProgressRing } from "@/components/common/ProgressBar";
import { SelectField } from "@/components/common/Form";
import { StatusBadge } from "@/components/common/StatusBadge";
import { InfoRow } from "@/components/cards/ListRow";
import { useData, useSession, useUI } from "@/hooks/useApp";
import { useGrowth, useProfileStrength } from "@/hooks/useBusiness";
import { cn } from "@/utils/cn";

const DOC_TYPES = ["Business license (SIUP)", "Shop rental agreement", "Halal certificate", "Latest tax report (SPT)"];

export default function ProfilePage() {
  const { merchant } = useSession();
  const { uploadDocument } = useData();
  const { toast, requireAccount } = useUI();
  const profile = useProfileStrength();
  const growth = useGrowth();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [docType, setDocType] = useState(DOC_TYPES[0]);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<PickedFile | null>(null);

  const upload = () => {
    setUploading(true);
    window.setTimeout(() => {
      uploadDocument("additional-document");
      setUploading(false);
      setUploadOpen(false);
      setFile(null);
      toast(`${file?.name ?? "Document"} received. Profile is now 100% complete.`);
    }, 1500);
  };

  return (
    <>
      <TopAppBar title="Business Profile" subtitle="Merchant Profile and Business Verification" />
      <PageBody>
        <section className="card flex items-center gap-4 p-4">
          <Avatar initials={merchant.initials} size={60} tone="navy" />
          <div className="min-w-0 flex-1">
            <p className="text-[18px] font-extrabold text-ink">{merchant.name}</p>
            <p className="text-[12.5px] text-ink-muted">Merchant ID {merchant.merchantId}</p>
            <div className="mt-1.5"><StatusBadge status="Verified" icon={<BadgeCheck className="h-3 w-3" />} /></div>
          </div>
        </section>

        <section className="hero-navy rounded-[28px] p-5 text-white">
          <div className="flex items-center gap-4">
            <ProgressRing value={profile.strength} size={88} stroke={9} tone="#FFB600" track="rgba(255,255,255,0.15)" label={`Profile strength ${profile.strength}%`}>
              <span className="text-[19px] font-extrabold">{profile.strength}%</span>
            </ProgressRing>
            <div>
              <p className="text-[12px] text-white/85">Business Profile Strength</p>
              <p className="text-[15px] font-bold">{profile.missing.length ? "Complete your profile to strengthen your Growth Score." : "Your profile is complete."}</p>
            </div>
          </div>
          <p className="mt-3 text-[12.5px] leading-relaxed text-white/85">A more complete profile helps Livin Merchant understand your business better.</p>
        </section>

        <section className="card p-4">
          <h2 className="text-[15px] font-bold text-ink">Profile checklist</h2>
          <ul className="mt-3 space-y-2.5">
            {profile.items.map((i) => (
              <li key={i.id} className="flex items-center gap-3">
                {i.done ? <CheckCircle2 className="h-5 w-5 text-success" /> : <CircleDashed className="h-5 w-5 text-warning" />}
                <span className={cn("flex-1 text-[13.5px]", i.done ? "text-ink" : "font-semibold text-warning-dark")}>{i.label}</span>
                <span className="text-[11.5px] text-ink-muted">{i.done ? "Completed" : "Missing"}</span>
              </li>
            ))}
          </ul>
          {profile.missing.length > 0 && (
            <Button block className="mt-4" leftIcon={<FileUp className="h-4 w-4" />} onClick={() => requireAccount("document upload") && setUploadOpen(true)}>
              Upload additional business document
            </Button>
          )}
        </section>

        <section className="card px-4 py-2">
          <InfoRow label="Owner" value={merchant.owner} />
          <InfoRow label="Business type" value={merchant.businessType} />
          <InfoRow label="Business age" value={merchant.businessAge} />
          <InfoRow label="Location" value={merchant.location} />
          <InfoRow label="Address" value={merchant.address} />
          <InfoRow label="Member since" value={merchant.memberSince} />
          <InfoRow label="Settlement account" value={merchant.accountNumber} />
          <InfoRow label="Status" value={merchant.verificationStatus} strong />
          <InfoRow label="Growth Stage" value={`${growth.stage.id} · Score ${growth.score}`} />
        </section>

        <section className="card p-4">
          <h2 className="flex items-center gap-2 text-[15px] font-bold text-ink">
            <ShieldCheck className="h-4 w-4 text-success" /> Business Verification
          </h2>
          <ul className="mt-3 space-y-2 text-[13.5px]">
            {[
              ["Owner identity (KTP)", true],
              ["Business identity (NIB)", true],
              ["Tax number (NPWP)", true],
              ["Mandiri business account", true],
              ["Additional business document", profile.missing.length === 0],
            ].map(([label, ok]) => (
              <li key={String(label)} className="flex items-center justify-between">
                <span className="text-ink-soft">{label}</span>
                <StatusBadge status={ok ? "Verified" : "Pending"} />
              </li>
            ))}
          </ul>
        </section>

        <p className="flex items-center gap-2 text-[12px] text-ink-muted">
          <Store className="h-4 w-4" /> To change legal business details, contact Mandiri through Help Center.
        </p>
      </PageBody>

      <BottomSheet
        open={uploadOpen}
        onClose={() => !uploading && setUploadOpen(false)}
        title="Upload business document"
        subtitle="Photo or PDF, up to 5 MB"
        footer={
          <Button block size="lg" onClick={upload} loading={uploading} disabled={!file}>
            {uploading ? "Verifying document" : "Upload and verify"}
          </Button>
        }
      >
        <SelectField label="Document type" value={docType} onChange={(e) => setDocType(e.target.value)} options={DOC_TYPES.map((d) => ({ value: d, label: d }))} />
        <div className="mt-4">
          <FilePicker
            value={file}
            onChange={setFile}
            label="Choose document"
            hint="Photo or PDF, up to 5 MB"
            accept="image/*,application/pdf"
          />
        </div>
      </BottomSheet>
    </>
  );
}
