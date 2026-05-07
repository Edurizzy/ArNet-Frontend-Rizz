'use client';

import { Plus, Play, Download, Workflow, FileText, Webhook } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAutomationsTabStore, useWorkflowsDataStore, useSimulationStore, useWorkflowSelectionStore } from '@/stores/automations-store';
import { simulateWorkflowExecution } from '@/services/automations-api';
import { LivePulseIndicator } from './live-pulse-indicator';
import type { AutomationsTab } from '@/types/automations';

export function AutomationHeader() {
  const { activeTab, setActiveTab } = useAutomationsTabStore();
  const { workflows } = useWorkflowsDataStore();
  const { selectedWorkflowId } = useWorkflowSelectionStore();
  const { isSimulating, startSimulation, updateStepState, appendSimulationLog, endSimulation } = useSimulationStore();

  const activeWorkflows = workflows.filter((w) => w.status === 'active').length;
  const totalExecutionsToday = workflows.reduce((sum, w) => sum + Math.floor(w.executionCount / 30), 0);

  const handleSimulate = async () => {
    if (!selectedWorkflowId || isSimulating) return;

    startSimulation(selectedWorkflowId);

    await simulateWorkflowExecution(
      selectedWorkflowId,
      (nodeId, state) => updateStepState(nodeId, state),
      (log) => appendSimulationLog(log)
    );

    endSimulation();
  };

  return (
    <div className="border-b border-zinc-800 bg-zinc-950 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-lg font-semibold text-zinc-100">
              <Workflow className="h-5 w-5 text-emerald-500" />
              Motor de Automações & Eventos
            </h1>
            <p className="mt-0.5 text-xs text-zinc-500">
              {activeWorkflows} regras ativas · {totalExecutionsToday.toLocaleString()} execuções hoje
            </p>
          </div>
          <LivePulseIndicator />
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-zinc-700 bg-zinc-900 text-xs text-zinc-300 hover:bg-zinc-800"
            onClick={handleSimulate}
            disabled={!selectedWorkflowId || isSimulating}
          >
            <Play className="mr-1.5 h-3.5 w-3.5" />
            {isSimulating ? 'Simulando...' : 'Simular Execução'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-8 border-zinc-700 bg-zinc-900 text-xs text-zinc-300 hover:bg-zinc-800"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Exportar Logs
          </Button>

          <Button size="sm" className="h-8 bg-emerald-600 text-xs hover:bg-emerald-700">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Nova Automação
          </Button>
        </div>
      </div>

      <div className="mt-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AutomationsTab)}>
          <TabsList className="h-9 bg-zinc-900/50 p-1">
            <TabsTrigger
              value="workflows"
              className="h-7 gap-1.5 px-3 text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100"
            >
              <Workflow className="h-3.5 w-3.5" />
              Regras
            </TabsTrigger>
            <TabsTrigger
              value="execution_logs"
              className="h-7 gap-1.5 px-3 text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100"
            >
              <FileText className="h-3.5 w-3.5" />
              Logs de Execução
            </TabsTrigger>
            <TabsTrigger
              value="webhooks"
              className="h-7 gap-1.5 px-3 text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100"
            >
              <Webhook className="h-3.5 w-3.5" />
              Webhooks Inbound
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
