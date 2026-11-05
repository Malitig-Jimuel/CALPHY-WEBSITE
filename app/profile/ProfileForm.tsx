"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

type Message = { kind: "success" | "error"; text: string } | null;

async function readResponse(response: Response) {
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "The request could not be completed.");
  }

  return result as { message?: string; user?: { name: string; email: string } };
}

export default function ProfileForm({
  name: initialName,
  email: initialEmail,
}: {
  name: string;
  email: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [resettingProgress, setResettingProgress] = useState(false);
  const [profileMessage, setProfileMessage] = useState<Message>(null);
  const [passwordMessage, setPasswordMessage] = useState<Message>(null);
  const [progressMessage, setProgressMessage] = useState<Message>(null);

  async function updateProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingProfile(true);
    setProfileMessage(null);

    try {
      const result = await readResponse(
        await fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ name, email }),
        })
      );

      if (!result.user) {
        throw new Error("The updated profile could not be confirmed.");
      }

      setName(result.user.name);
      setEmail(result.user.email);
      setProfileMessage({ kind: "success", text: "Personal information updated." });
      window.dispatchEvent(new Event("calph-profile-updated"));
      router.refresh();
    } catch (error) {
      setProfileMessage({
        kind: "error",
        text: error instanceof Error ? error.message : "Unable to update your profile.",
      });
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingPassword(true);
    setPasswordMessage(null);

    try {
      const result = await readResponse(
        await fetch("/api/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({
            action: "change-password",
            currentPassword,
            newPassword,
            confirmPassword,
          }),
        })
      );

      setPasswordMessage({ kind: "success", text: result.message ?? "Password updated." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setPasswordMessage({
        kind: "error",
        text: error instanceof Error ? error.message : "Unable to change your password.",
      });
    } finally {
      setSavingPassword(false);
    }
  }

  async function resetLearningProgress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResettingProgress(true);
    setProgressMessage(null);

    try {
      const result = await readResponse(
        await fetch("/api/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({
            action: "reset-progress",
            currentPassword: resetPassword,
          }),
        })
      );

      setProgressMessage({ kind: "success", text: result.message ?? "Learning progress reset." });
      setResetPassword("");
      setShowResetDialog(false);
      window.dispatchEvent(new Event("calph-learning-progress-reset"));
      router.refresh();
    } catch (error) {
      setProgressMessage({
        kind: "error",
        text: error instanceof Error ? error.message : "Unable to reset learning progress.",
      });
    } finally {
      setResettingProgress(false);
    }
  }

  return (
    <div className="mt-8 space-y-6">
      <section className="rounded-2xl border border-slate-700/60 bg-[#10182B] p-5 sm:p-7">
        <h2 className="text-xl font-bold">Personal Information</h2>
        <p className="mt-1 text-sm text-slate-400">
          Update the name and email address associated with your account.
        </p>
        <form onSubmit={updateProfile} className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="profile-name" className="mb-2 block text-sm font-medium text-slate-300">
              Name
            </label>
            <input
              id="profile-name"
              name="name"
              autoComplete="name"
              required
              minLength={2}
              maxLength={50}
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="min-h-11 w-full rounded-xl border border-white/10 bg-[#0B1222] px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400"
            />
          </div>
          <div>
            <label htmlFor="profile-email" className="mb-2 block text-sm font-medium text-slate-300">
              Email address
            </label>
            <input
              id="profile-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="min-h-11 w-full rounded-xl border border-white/10 bg-[#0B1222] px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400"
            />
          </div>
          {profileMessage && <StatusMessage message={profileMessage} />}
          <button
            type="submit"
            disabled={savingProfile}
            className="inline-flex min-h-11 w-fit items-center justify-center rounded-xl bg-sky-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-sky-300 disabled:opacity-60 sm:col-span-2"
          >
            {savingProfile ? "Saving..." : "Save changes"}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-700/60 bg-[#10182B] p-5 sm:p-7">
        <h2 className="text-xl font-bold">Account Security</h2>
        <p className="mt-1 text-sm text-slate-400">Change your password securely.</p>
        <form onSubmit={changePassword} className="mt-6 grid gap-5 sm:grid-cols-2">
          <PasswordField
            id="current-password"
            label="Current password"
            value={currentPassword}
            onChange={setCurrentPassword}
            autoComplete="current-password"
          />
          <div className="hidden sm:block" />
          <PasswordField
            id="new-password"
            label="New password"
            value={newPassword}
            onChange={setNewPassword}
            autoComplete="new-password"
            minLength={8}
          />
          <PasswordField
            id="confirm-new-password"
            label="Confirm new password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
            minLength={8}
          />
          {passwordMessage && <StatusMessage message={passwordMessage} />}
          <button
            type="submit"
            disabled={savingPassword}
            className="inline-flex min-h-11 w-fit items-center justify-center rounded-xl border border-sky-300/25 px-5 py-3 text-sm font-semibold text-sky-200 transition hover:bg-sky-300/10 disabled:opacity-60 sm:col-span-2"
          >
            {savingPassword ? "Updating..." : "Update password"}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-rose-400/15 bg-[#10182B] p-5 sm:p-7">
        <h2 className="text-xl font-bold">Learning Progress Management</h2>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
          Resetting permanently deletes your saved lesson progress and quiz attempts. Your account and personal information will remain.
        </p>
        {progressMessage && <StatusMessage message={progressMessage} />}
        <button
          type="button"
          onClick={() => {
            setProgressMessage(null);
            setShowResetDialog(true);
          }}
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl border border-rose-400/30 px-5 py-3 text-sm font-semibold text-rose-200 transition hover:bg-rose-400/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-300"
        >
          Reset Learning Progress
        </button>
      </section>

      {showResetDialog && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !resettingProgress) {
              setShowResetDialog(false);
            }
          }}
        >
          <form
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-dialog-title"
            onSubmit={resetLearningProgress}
            className="w-full max-w-md rounded-2xl border border-rose-400/20 bg-[#10182B] p-6 shadow-2xl"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-rose-400/10 text-rose-300">
              <AlertTriangle size={20} aria-hidden="true" />
            </span>
            <h2 id="reset-dialog-title" className="mt-4 text-xl font-bold">
              Permanently reset learning progress?
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              This deletes only your saved quiz attempts and lesson progress. Enter your current account password to confirm.
            </p>
            {progressMessage?.kind === "error" && (
              <StatusMessage message={progressMessage} />
            )}
            <label htmlFor="reset-password" className="mb-2 mt-5 block text-sm font-medium text-slate-300">
              Current password
            </label>
            <input
              id="reset-password"
              type="password"
              autoComplete="current-password"
              required
              maxLength={72}
              value={resetPassword}
              onChange={(event) => setResetPassword(event.target.value)}
              className="min-h-11 w-full rounded-xl border border-white/10 bg-[#0B1222] px-4 py-3 text-sm text-white outline-none transition focus:border-rose-300"
            />
            <div className="mt-5 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                disabled={resettingProgress}
                onClick={() => setShowResetDialog(false)}
                className="min-h-11 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/5 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={resettingProgress}
                className="min-h-11 rounded-xl bg-rose-400 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-rose-300 disabled:opacity-50"
              >
                {resettingProgress ? "Resetting..." : "Confirm reset"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function StatusMessage({ message }: { message: Exclude<Message, null> }) {
  const isSuccess = message.kind === "success";

  return (
    <p
      role={isSuccess ? "status" : "alert"}
      className={`flex items-center gap-2 text-sm sm:col-span-2 ${
        isSuccess ? "text-emerald-300" : "text-rose-300"
      }`}
    >
      {isSuccess && <CheckCircle2 size={16} aria-hidden="true" />}
      {message.text}
    </p>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  minLength,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  minLength?: number;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-slate-300">
        {label}
      </label>
      <input
        id={id}
        type="password"
        autoComplete={autoComplete}
        required
        minLength={minLength}
        maxLength={72}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 w-full rounded-xl border border-white/10 bg-[#0B1222] px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400"
      />
    </div>
  );
}
