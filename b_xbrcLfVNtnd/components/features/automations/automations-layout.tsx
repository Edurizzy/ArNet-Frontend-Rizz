'use client';

import { useEffect } from 'react';
import { useAutomationsTabStore, useWorkflowsDataStore, useExecutionLogsStore, useWebhooksStore } from '@/stores/automations-store';
import { fetchWorkflows, fetchEventLogs, fetchWebhooks, subscribeToEventStream, subscribeToWebhookStream } from '@/services/automations-api';
import { AutomationHeader } from './automation-header';
import { WorkflowList } from './workflow-list';
import { WorkflowBuilder } from './workflow-builder';
import { EventLogViewer } from './event-log-viewer';
import { WebhookInspector } from './webhook-inspector';
import { ExecutionTracePanel } from './execution-trace-panel';
import { useWorkflowSelectionStore, useExecutionTracePanelStore } from '@/stores/automations-store';

export function AutomationsLayout() {
  const { activeTab } = useAutomationsTabStore();
  const { setWorkflows, setLoading: setWorkflowsLoading } = useWorkflowsDataStore();
  const { setLogs, appendLog, setLoading: setLogsLoading, isLiveStreamPaused } = useExecutionLogsStore();
  const { setWebhooks, appendWebhook, setLoading: setWebhooksLoading, isLiveStreamActive } = useWebhooksStore();
  const { isBuilderOpen } = useWorkflowSelectionStore();
  const { isOpen: isTracePanelOpen } = useExecutionTracePanelStore();

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setWorkflowsLoading(true);
      setLogsLoading(true);
      setWebhooksLoading(true);

      const [workflows, logs, webhooks] = await Promise.all([
        fetchWorkflows(),
        fetchEventLogs(),
        fetchWebhooks(),
      ]);

      setWorkflows(workflows);
      setLogs(logs);
      setWebhooks(webhooks);

      setWorkflowsLoading(false);
      setLogsLoading(false);
      setWebhooksLoading(false);
    };

    loadData();
  }, [setWorkflows, setLogs, setWebhooks, setWorkflowsLoading, setLogsLoading, setWebhooksLoading]);

  // Subscribe to realtime event streams
  useEffect(() => {
    if (isLiveStreamPaused) return;

    const unsubscribe = subscribeToEventStream((log) => {
      appendLog(log);
    }, 4000);

    return unsubscribe;
  }, [appendLog, isLiveStreamPaused]);

  useEffect(() => {
    if (!isLiveStreamActive) return;

    const unsubscribe = subscribeToWebhookStream((webhook) => {
      appendWebhook(webhook);
    }, 6000);

    return unsubscribe;
  }, [appendWebhook, isLiveStreamActive]);

  return (
    <div className="flex h-full flex-col bg-zinc-950">
      <AutomationHeader />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto">
          {activeTab === 'workflows' && (
            <div className="flex h-full">
              <div className={`${isBuilderOpen ? 'w-80 border-r border-zinc-800' : 'flex-1'} overflow-hidden`}>
                <WorkflowList />
              </div>
              {isBuilderOpen && (
                <div className="flex-1 overflow-hidden">
                  <WorkflowBuilder />
                </div>
              )}
            </div>
          )}

          {activeTab === 'execution_logs' && <EventLogViewer />}

          {activeTab === 'webhooks' && <WebhookInspector />}
        </div>

        {isTracePanelOpen && (
          <div className="w-[480px] border-l border-zinc-800">
            <ExecutionTracePanel />
          </div>
        )}
      </div>
    </div>
  );
}
