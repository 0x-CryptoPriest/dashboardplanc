import { DashboardLayout } from "@/components/DashboardLayout";
import { Exchange, mockDagsterJobs, mockDagsterRuns, DagsterJob, DagsterRun } from "@/lib/mock-data";
import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Play, Clock, Ban, ChevronDown, ChevronRight, ArrowRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const jobStatusConfig: Record<string, { icon: typeof CheckCircle; color: string; bg: string }> = {
  SUCCESS: { icon: CheckCircle, color: 'text-profit', bg: 'bg-profit/10' },
  RUNNING: { icon: Play, color: 'text-primary', bg: 'bg-primary/10' },
  FAILED: { icon: XCircle, color: 'text-loss', bg: 'bg-loss/10' },
  QUEUED: { icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
  CANCELLED: { icon: Ban, color: 'text-muted-foreground', bg: 'bg-muted/30' },
};

const logLevelColor: Record<string, string> = {
  INFO: 'text-info',
  WARNING: 'text-warning',
  ERROR: 'text-loss',
  DEBUG: 'text-muted-foreground',
};

function DAGView({ jobs }: { jobs: DagsterJob[] }) {
  // Build layers from upstream/downstream relationships
  const getLayer = (job: DagsterJob): number => {
    if (job.upstream.length === 0) return 0;
    return 1 + Math.max(...job.upstream.map(name => {
      const parent = jobs.find(j => j.name === name);
      return parent ? getLayer(parent) : 0;
    }));
  };

  const layers: DagsterJob[][] = [];
  jobs.forEach(job => {
    const layer = getLayer(job);
    if (!layers[layer]) layers[layer] = [];
    layers[layer].push(job);
  });

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-8 min-w-[800px] py-4 px-2">
        {layers.map((layer, li) => (
          <div key={li} className="flex flex-col gap-3 items-center">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Layer {li}</div>
            {layer.map(job => {
              const { icon: Icon, color, bg } = jobStatusConfig[job.status];
              return (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: li * 0.1 }}
                  className="rounded-lg border border-border bg-card p-3 w-[180px] relative"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon className={`h-3 w-3 ${color}`} />
                    <span className="text-xs font-mono font-semibold text-foreground truncate">{job.name}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground">{job.duration}</div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {job.tags.slice(0, 2).map(tag => (
                      <span key={tag} className={`text-[9px] ${bg} ${color} px-1.5 py-0.5 rounded`}>{tag}</span>
                    ))}
                  </div>
                  {job.downstream.length > 0 && (
                    <ArrowRight className="absolute -right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  )}
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function RunLogViewer({ run }: { run: DagsterRun }) {
  const { icon: Icon, color } = jobStatusConfig[run.status];
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${color}`} />
          <span className="font-mono text-sm text-foreground">{run.jobName}</span>
          <span className="text-xs text-muted-foreground">({run.id})</span>
        </div>
        <div className="text-xs text-muted-foreground">{run.startTime} · {run.duration}</div>
      </div>
      <div className="bg-background rounded-lg p-3 font-mono text-xs space-y-1 max-h-[300px] overflow-auto">
        {run.logs.map((log, i) => (
          <div key={i} className="flex gap-2">
            <span className="text-muted-foreground min-w-[70px]">{log.timestamp}</span>
            <span className={`min-w-[60px] ${logLevelColor[log.level]}`}>[{log.level}]</span>
            {log.step && <span className="text-primary min-w-[80px]">[{log.step}]</span>}
            <span className="text-foreground">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Content({ exchangeFilter: _ }: { exchangeFilter: Exchange | 'all' }) {
  const [expandedJob, setExpandedJob] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-foreground">Dagster Jobs</h1>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="list">Job List</TabsTrigger>
          <TabsTrigger value="dag">DAG View</TabsTrigger>
          <TabsTrigger value="runs">Recent Runs</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-2">
          {mockDagsterJobs.map((job, i) => {
            const { icon: Icon, color, bg } = jobStatusConfig[job.status];
            const isExpanded = expandedJob === job.id;
            return (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="rounded-lg border border-border bg-card overflow-hidden"
              >
                <div
                  className="p-3 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedJob(isExpanded ? null : job.id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`h-4 w-4 ${color} flex-shrink-0`} />
                    <div className="min-w-0">
                      <div className="font-mono text-sm text-foreground">{job.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{job.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="flex flex-wrap gap-1">
                      {job.tags.map(tag => (
                        <span key={tag} className={`text-[10px] ${bg} ${color} px-1.5 py-0.5 rounded`}>{tag}</span>
                      ))}
                    </div>
                    <div className="text-xs text-muted-foreground text-right min-w-[80px]">
                      <div className="font-mono">{job.schedule}</div>
                    </div>
                    {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </div>

                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="border-t border-border px-4 py-3 bg-muted/10"
                  >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div><span className="text-muted-foreground">Last Run:</span> <span className="font-mono text-foreground">{job.lastRun}</span></div>
                      <div><span className="text-muted-foreground">Duration:</span> <span className="font-mono text-foreground">{job.duration}</span></div>
                      <div><span className="text-muted-foreground">Next Run:</span> <span className="font-mono text-foreground">{job.nextRun}</span></div>
                      <div><span className="text-muted-foreground">Schedule:</span> <span className="font-mono text-foreground">{job.schedule}</span></div>
                    </div>
                    {job.upstream.length > 0 && (
                      <div className="text-xs mt-2"><span className="text-muted-foreground">Upstream: </span><span className="font-mono text-primary">{job.upstream.join(', ')}</span></div>
                    )}
                    {job.downstream.length > 0 && (
                      <div className="text-xs mt-1"><span className="text-muted-foreground">Downstream: </span><span className="font-mono text-primary">{job.downstream.join(', ')}</span></div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </TabsContent>

        <TabsContent value="dag">
          <div className="rounded-lg border border-border bg-card p-4">
            <DAGView jobs={mockDagsterJobs} />
          </div>
        </TabsContent>

        <TabsContent value="runs" className="space-y-3">
          {mockDagsterRuns.map(run => (
            <RunLogViewer key={run.id} run={run} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function DagsterJobsPage() {
  return (
    <DashboardLayout>
      {({ exchangeFilter }) => <Content exchangeFilter={exchangeFilter} />}
    </DashboardLayout>
  );
}
