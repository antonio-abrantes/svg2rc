import { MonitorSmartphone } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";

interface InstallShortcutDialogProps {
  open: boolean;
  canNativeInstall: boolean;
  onAccept: () => void;
  onDismiss: () => void;
}

export function InstallShortcutDialog({
  open,
  canNativeInstall,
  onAccept,
  onDismiss,
}: InstallShortcutDialogProps) {
  const { t } = useI18n();

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onDismiss();
      }}
    >
      <DialogContent className="max-w-md border-border bg-card sm:rounded-xl">
        <DialogHeader>
          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <MonitorSmartphone className="h-5 w-5" aria-hidden />
          </div>
          <DialogTitle>{t("shortcut.title")}</DialogTitle>
          <DialogDescription>
            {canNativeInstall
              ? t("shortcut.descriptionNative")
              : t("shortcut.descriptionManual")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="secondary" onClick={onDismiss}>
            {t("shortcut.dismiss")}
          </Button>
          <Button type="button" onClick={onAccept}>
            {canNativeInstall ? t("shortcut.accept") : t("shortcut.acknowledge")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
