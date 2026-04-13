import { DashboardLayout } from "@/components/DashboardLayout";
import { PageTransition } from "@/components/PageTransition";
import { motion } from "framer-motion";
import {
  ApiKeyPayload,
  ApiKeyRecord,
  ConnectionHealth,
  Exchange,
  NotificationPreference,
  SystemInfo,
  createApiKey,
  deleteApiKey,
  fetchApiKeys,
  fetchConnections,
  fetchNotificationPreferences,
  fetchSystemInfo,
  updateApiKey,
  updateNotificationPreferences,
} from "@/lib/planc-api";
import {
  Bell,
  CheckCircle,
  Key,
  Pencil,
  Plus,
  Server,
  Shield,
  Trash2,
  Wifi,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";

const SETTINGS_QUERY_KEYS = {
  apiKeys: ["settings", "api-keys"] as const,
  connections: ["settings", "connections"] as const,
  notifications: ["settings", "notifications"] as const,
  system: ["settings", "system"] as const,
};

const EXCHANGE_OPTIONS: Array<{ value: Exchange; label: string }> = [
  { value: "binance", label: "Binance" },
  { value: "hyperliquid", label: "Hyperliquid" },
];

const STATUS_OPTIONS: Array<{ value: ApiKeyRecord["status"]; label: string }> = [
  { value: "active", label: "Active" },
  { value: "expired", label: "Expired" },
  { value: "error", label: "Error" },
];

const NOTIFICATION_META: Record<string, { label: string; description: string }> = {
  strategy_error_alerts: {
    label: "Strategy Error Alerts",
    description: "Notify when a strategy encounters an error.",
  },
  large_drawdown_warning: {
    label: "Large Drawdown Warning",
    description: "Alert when drawdown exceeds the configured threshold.",
  },
  order_fill_notifications: {
    label: "Order Fill Notifications",
    description: "Notify on order fills and partial fills.",
  },
  daily_pnl_summary: {
    label: "Daily PnL Summary",
    description: "Send a daily end-of-day performance summary.",
  },
  connection_loss_alert: {
    label: "Connection Loss Alert",
    description: "Alert when an exchange or platform connection is lost.",
  },
  dagster_job_failures: {
    label: "Dagster Job Failures",
    description: "Notify when scheduled Dagster jobs fail.",
  },
  data_gap_warnings: {
    label: "Data Gap Warnings",
    description: "Alert on data quality issues and missing bars.",
  },
  margin_call_warning: {
    label: "Margin Call Warning",
    description: "Alert when margin usage approaches the risk limit.",
  },
};

type ApiKeyFormState = {
  name: string;
  exchange: Exchange;
  isTestnet: boolean;
  apiKey: string;
  apiSecret: string;
  status: ApiKeyRecord["status"];
};

const EMPTY_FORM: ApiKeyFormState = {
  name: "",
  exchange: "binance",
  isTestnet: true,
  apiKey: "",
  apiSecret: "",
  status: "active",
};

function formatExchangeLabel(exchange: Exchange): string {
  return EXCHANGE_OPTIONS.find((option) => option.value === exchange)?.label ?? exchange;
}

function humanizeNotificationKey(key: string): string {
  return key
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getNotificationMeta(key: string) {
  return (
    NOTIFICATION_META[key] ?? {
      label: humanizeNotificationKey(key),
      description: "Notification preference.",
    }
  );
}

function buildFormState(record?: ApiKeyRecord | null): ApiKeyFormState {
  if (!record) {
    return EMPTY_FORM;
  }

  return {
    name: record.name,
    exchange: record.exchange,
    isTestnet: record.isTestnet,
    apiKey: "",
    apiSecret: "",
    status: record.status,
  };
}

function buildCreatePayload(form: ApiKeyFormState): ApiKeyPayload {
  const payload: ApiKeyPayload = {
    name: form.name.trim(),
    exchange: form.exchange,
    isTestnet: form.isTestnet,
  };

  const apiKey = form.apiKey.trim();
  const apiSecret = form.apiSecret.trim();

  if (apiKey) {
    payload.apiKey = apiKey;
  }
  if (apiSecret) {
    payload.apiSecret = apiSecret;
  }

  return payload;
}

function buildUpdatePayload(
  form: ApiKeyFormState,
  original: ApiKeyRecord,
): (Partial<ApiKeyPayload> & { status?: ApiKeyRecord["status"] }) | null {
  const payload: Partial<ApiKeyPayload> & { status?: ApiKeyRecord["status"] } = {};

  if (form.name.trim() !== original.name) {
    payload.name = form.name.trim();
  }
  if (form.exchange !== original.exchange) {
    payload.exchange = form.exchange;
  }
  if (form.isTestnet !== original.isTestnet) {
    payload.isTestnet = form.isTestnet;
  }
  if (form.status !== original.status) {
    payload.status = form.status;
  }

  const apiKey = form.apiKey.trim();
  const apiSecret = form.apiSecret.trim();

  if (apiKey) {
    payload.apiKey = apiKey;
  }
  if (apiSecret) {
    payload.apiSecret = apiSecret;
  }

  return Object.keys(payload).length > 0 ? payload : null;
}

function APIKeyCard({
  record,
  delay,
  onEdit,
  onDelete,
}: {
  record: ApiKeyRecord;
  delay: number;
  onEdit: (record: ApiKeyRecord) => void;
  onDelete: (record: ApiKeyRecord) => void;
}) {
  const statusConfig = {
    active: {
      icon: CheckCircle,
      textClass: "text-profit",
      badgeClass: "bg-profit/10 text-profit",
      label: "Active",
    },
    expired: {
      icon: XCircle,
      textClass: "text-warning",
      badgeClass: "bg-warning/10 text-warning",
      label: "Expired",
    },
    error: {
      icon: XCircle,
      textClass: "text-loss",
      badgeClass: "bg-loss/10 text-loss",
      label: "Error",
    },
  } as const;

  const config = statusConfig[record.status];
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-lg border border-border bg-card p-4"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-primary" />
            <span className="truncate text-sm font-semibold text-foreground">{record.name}</span>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">{formatExchangeLabel(record.exchange)}</div>
        </div>
        <div className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] ${config.badgeClass}`}>
          <StatusIcon className="h-3 w-3" />
          {config.label}
        </div>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Environment</span>
          <span className="font-mono text-foreground">{record.isTestnet ? "Testnet" : "Live"}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">API Key</span>
          <span className="font-mono text-foreground">{record.maskedKey}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Secret</span>
          <span className={`font-mono ${record.hasSecret ? "text-profit" : "text-warning"}`}>
            {record.hasSecret ? "Configured" : "Missing"}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Last Used</span>
          <span className={`font-mono ${config.textClass}`}>{record.lastUsed}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(record)}>
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Button>
        <Button variant="ghost" size="sm" className="text-loss hover:text-loss" onClick={() => onDelete(record)}>
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </Button>
      </div>
    </motion.div>
  );
}

function ConnectionCheck({ item, delay }: { item: ConnectionHealth; delay: number }) {
  const dotClass =
    item.status === "healthy"
      ? "bg-profit"
      : item.status === "degraded"
        ? "bg-warning"
        : "bg-loss";
  const textClass =
    item.status === "healthy"
      ? "text-profit"
      : item.status === "degraded"
        ? "text-warning"
        : "text-loss";

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex items-center justify-between border-b border-border/50 py-2 last:border-0"
    >
      <div className="flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full ${dotClass}`} />
        <div>
          <div className="text-sm text-foreground">{item.name}</div>
          <div className="text-[10px] font-mono text-muted-foreground">{item.endpoint}</div>
        </div>
      </div>
      <div className="text-right">
        <div className={`text-xs font-mono ${textClass}`}>{item.latency}</div>
        <div className={`text-[10px] capitalize ${textClass}`}>{item.status}</div>
      </div>
    </motion.div>
  );
}

function Content({ exchangeFilter: _exchangeFilter }: { exchangeFilter: Exchange | "all" }) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ApiKeyRecord | null>(null);
  const [form, setForm] = useState<ApiKeyFormState>(EMPTY_FORM);
  const [recordToDelete, setRecordToDelete] = useState<ApiKeyRecord | null>(null);
  const [notificationDraft, setNotificationDraft] = useState<NotificationPreference[]>([]);

  const apiKeysQuery = useQuery({
    queryKey: SETTINGS_QUERY_KEYS.apiKeys,
    queryFn: fetchApiKeys,
  });
  const connectionsQuery = useQuery({
    queryKey: SETTINGS_QUERY_KEYS.connections,
    queryFn: fetchConnections,
  });
  const notificationsQuery = useQuery({
    queryKey: SETTINGS_QUERY_KEYS.notifications,
    queryFn: fetchNotificationPreferences,
  });
  const systemQuery = useQuery({
    queryKey: SETTINGS_QUERY_KEYS.system,
    queryFn: fetchSystemInfo,
  });

  useEffect(() => {
    if (notificationsQuery.data) {
      setNotificationDraft(notificationsQuery.data);
    }
  }, [notificationsQuery.data]);

  const saveApiKeyMutation = useMutation({
    mutationFn: async (values: ApiKeyFormState) => {
      if (editingRecord) {
        const payload = buildUpdatePayload(values, editingRecord);
        if (!payload) {
          return editingRecord;
        }
        return updateApiKey(editingRecord.id, payload);
      }
      return createApiKey(buildCreatePayload(values));
    },
    onSuccess: (_, values) => {
      const hasChanges = !editingRecord || buildUpdatePayload(values, editingRecord) !== null;
      if (hasChanges) {
        toast.success(editingRecord ? "API key updated" : "API key created");
      } else {
        toast.info("No changes to save");
      }
      void queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEYS.apiKeys });
      setDialogOpen(false);
      setEditingRecord(null);
      setForm(EMPTY_FORM);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to save API key");
    },
  });

  const deleteApiKeyMutation = useMutation({
    mutationFn: deleteApiKey,
    onSuccess: () => {
      toast.success("API key deleted");
      void queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEYS.apiKeys });
      setRecordToDelete(null);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to delete API key");
    },
  });

  const saveNotificationsMutation = useMutation({
    mutationFn: updateNotificationPreferences,
    onSuccess: (data) => {
      setNotificationDraft(data);
      queryClient.setQueryData(SETTINGS_QUERY_KEYS.notifications, data);
      toast.success("Notification preferences updated");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update notifications");
      setNotificationDraft(notificationsQuery.data ?? []);
    },
  });

  const notificationItems = useMemo(
    () => notificationDraft.map((item) => ({ ...item, ...getNotificationMeta(item.key) })),
    [notificationDraft],
  );

  function openCreateDialog() {
    setEditingRecord(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }

  function openEditDialog(record: ApiKeyRecord) {
    setEditingRecord(record);
    setForm(buildFormState(record));
    setDialogOpen(true);
  }

  function handleDialogChange(open: boolean) {
    setDialogOpen(open);
    if (!open) {
      setEditingRecord(null);
      setForm(EMPTY_FORM);
    }
  }

  function handleApiKeySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    saveApiKeyMutation.mutate(form);
  }

  function handleNotificationToggle(key: string, enabled: boolean) {
    const previous = notificationDraft;
    const next = notificationDraft.map((item) => (item.key === key ? { ...item, enabled } : item));
    setNotificationDraft(next);
    saveNotificationsMutation.mutate(next, {
      onError: (error) => {
        setNotificationDraft(previous);
        toast.error(error instanceof Error ? error.message : "Failed to update notifications");
      },
    });
  }

  const isSubmittingApiKey = saveApiKeyMutation.isPending;
  const isDeletingApiKey = deleteApiKeyMutation.isPending;
  const notificationError = notificationsQuery.error instanceof Error ? notificationsQuery.error.message : null;

  return (
    <PageTransition>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-lg font-bold text-foreground">Settings</h1>
          <Button size="sm" onClick={openCreateDialog}>
            <Plus className="h-4 w-4" />
            Add API Key
          </Button>
        </div>

        <Tabs defaultValue="api-keys" className="w-full">
          <TabsList className="bg-muted/50 flex-wrap">
            <TabsTrigger value="api-keys">API Keys</TabsTrigger>
            <TabsTrigger value="connections">Connections</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="api-keys" className="space-y-4">
            <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-4">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Exchange Credentials</h2>
                <p className="text-xs text-muted-foreground">
                  Manage live and testnet API credentials without leaving the dashboard.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={openCreateDialog}>
                <Plus className="h-4 w-4" />
                New Key
              </Button>
            </div>

            {apiKeysQuery.error instanceof Error ? (
              <div className="rounded-lg border border-loss/30 bg-loss/5 p-4 text-sm text-loss">
                {apiKeysQuery.error.message}
              </div>
            ) : null}

            {apiKeysQuery.isLoading ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-44 animate-pulse rounded-lg border border-border bg-card/60" />
                ))}
              </div>
            ) : apiKeysQuery.data?.length ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {apiKeysQuery.data.map((record, index) => (
                  <APIKeyCard
                    key={record.id}
                    record={record}
                    delay={index * 0.05}
                    onEdit={openEditDialog}
                    onDelete={setRecordToDelete}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border bg-card/30 p-8 text-center">
                <Key className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                <div className="text-sm font-medium text-foreground">No API keys configured</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Add your first exchange credential to enable account connectivity.
                </div>
                <Button className="mt-4" size="sm" onClick={openCreateDialog}>
                  <Plus className="h-4 w-4" />
                  Create API Key
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="connections" className="space-y-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Wifi className="h-4 w-4 text-primary" />
                Connection Health
              </h2>

              {connectionsQuery.error instanceof Error ? (
                <div className="text-sm text-loss">{connectionsQuery.error.message}</div>
              ) : connectionsQuery.isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="h-12 animate-pulse rounded-md bg-muted/50" />
                  ))}
                </div>
              ) : (
                <div className="space-y-0">
                  {(connectionsQuery.data ?? []).map((item, index) => (
                    <ConnectionCheck key={item.name} item={item} delay={index * 0.04} />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <div className="rounded-lg border border-border bg-card p-4 space-y-4">
              <div>
                <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Bell className="h-4 w-4 text-primary" />
                  Notification Preferences
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Toggle operational alerts for trading, data, and scheduled jobs.
                </p>
              </div>

              {notificationError ? <div className="text-sm text-loss">{notificationError}</div> : null}

              {notificationsQuery.isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="h-14 animate-pulse rounded-md bg-muted/50" />
                  ))}
                </div>
              ) : (
                notificationItems.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between border-b border-border/50 py-2 last:border-0"
                  >
                    <div className="pr-4">
                      <div className="text-sm text-foreground">{item.label}</div>
                      <div className="text-xs text-muted-foreground">{item.description}</div>
                    </div>
                    <Switch
                      checked={item.enabled}
                      disabled={saveNotificationsMutation.isPending}
                      onCheckedChange={(checked) => handleNotificationToggle(item.key, checked)}
                    />
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="system" className="space-y-4">
            <div className="rounded-lg border border-border bg-card p-4 space-y-3">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Shield className="h-4 w-4 text-primary" />
                System Configuration
              </h2>

              {systemQuery.error instanceof Error ? (
                <div className="text-sm text-loss">{systemQuery.error.message}</div>
              ) : systemQuery.isLoading ? (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="h-10 animate-pulse rounded-md bg-muted/50" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 text-xs md:grid-cols-2">
                  {(systemQuery.data ?? []).map((item: SystemInfo) => (
                    <div key={item.label} className="flex justify-between border-b border-border/50 py-2 gap-4">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-mono text-right text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Server className="h-4 w-4 text-primary" />
                Integration Scope
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                This page is now backed by live PlanC settings endpoints for API keys, notifications,
                system metadata, and service health.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>{editingRecord ? "Edit API Key" : "Create API Key"}</DialogTitle>
            <DialogDescription>
              {editingRecord
                ? "Update credential metadata. Leave API key and secret blank to keep existing values."
                : "Add a new exchange credential for dashboard integrations."}
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleApiKeySubmit}>
            <div className="space-y-2">
              <Label htmlFor="api-key-name">Name</Label>
              <Input
                id="api-key-name"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Binance Main"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Exchange</Label>
                <Select
                  value={form.exchange}
                  onValueChange={(value) => setForm((current) => ({ ...current, exchange: value as Exchange }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select exchange" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXCHANGE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2.5">
                <div>
                  <div className="text-sm text-foreground">Use testnet</div>
                  <div className="text-xs text-muted-foreground">Toggle between paper/test and live credentials.</div>
                </div>
                <Switch
                  checked={form.isTestnet}
                  onCheckedChange={(checked) => setForm((current) => ({ ...current, isTestnet: checked }))}
                />
              </div>
            </div>

            {editingRecord ? (
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(value) =>
                    setForm((current) => ({ ...current, status: value as ApiKeyRecord["status"] }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="api-key-value">API Key</Label>
                <Input
                  id="api-key-value"
                  value={form.apiKey}
                  type="password"
                  onChange={(event) => setForm((current) => ({ ...current, apiKey: event.target.value }))}
                  placeholder={editingRecord ? "Leave blank to keep existing" : "Enter API key"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="api-secret-value">API Secret</Label>
                <Input
                  id="api-secret-value"
                  value={form.apiSecret}
                  type="password"
                  onChange={(event) => setForm((current) => ({ ...current, apiSecret: event.target.value }))}
                  placeholder={editingRecord ? "Leave blank to keep existing" : "Enter API secret"}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => handleDialogChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmittingApiKey || !form.name.trim()}>
                {isSubmittingApiKey ? "Saving..." : editingRecord ? "Save Changes" : "Create Key"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={recordToDelete !== null} onOpenChange={(open) => !open && setRecordToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete API key?</AlertDialogTitle>
            <AlertDialogDescription>
              {recordToDelete
                ? `This will permanently remove ${recordToDelete.name} from the dashboard settings.`
                : "This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingApiKey}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeletingApiKey || !recordToDelete}
              onClick={(event) => {
                event.preventDefault();
                if (!recordToDelete) {
                  return;
                }
                deleteApiKeyMutation.mutate(recordToDelete.id);
              }}
            >
              {isDeletingApiKey ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageTransition>
  );
}

export default function SettingsPage() {
  return (
    <DashboardLayout>
      {({ exchangeFilter }) => <Content exchangeFilter={exchangeFilter} />}
    </DashboardLayout>
  );
}
