/**
 * KosProjects - Primary Consumer Hook
 */

import { useMemo } from 'react';
import { useKosProjectsContext, KosProjectsContextValue } from '../context/KosProjectsContext';
import { ProjectTask } from '../types';

export interface ProjectStatsSummary {
  totalTasks: number;
  completedTasks: number;
  atRiskTasks: number;
  inProgressTasks: number;
  milestonesCount: number;
  completionPercent: number;
  totalEstimatedCost: number;
  phases: string[];
}

export interface UseProjectsReturn extends KosProjectsContextValue {
  projectStats: ProjectStatsSummary;
  tasksByPhase: Record<string, ProjectTask[]>;
}

export function useProjects(): UseProjectsReturn {
  const ctx = useKosProjectsContext();

  const tasksByPhase = useMemo(() => {
    const grouped: Record<string, ProjectTask[]> = {};
    for (const task of ctx.tasks) {
      const phase = task.phase || 'כללי';
      if (!grouped[phase]) grouped[phase] = [];
      grouped[phase].push(task);
    }
    return grouped;
  }, [ctx.tasks]);

  const projectStats = useMemo<ProjectStatsSummary>(() => {
    const totalTasks = ctx.tasks.length;
    const completedTasks = ctx.tasks.filter((t) => t.status === 'completed' || t.progress >= 100).length;
    const atRiskTasks = ctx.tasks.filter((t) => t.status === 'at_risk').length;
    const inProgressTasks = ctx.tasks.filter((t) => t.status === 'in_progress').length;
    const milestonesCount = ctx.tasks.filter((t) => t.isMilestone).length;
    const totalEstimatedCost = ctx.tasks.reduce((sum, t) => sum + (Number(t.estimatedCost) || 0), 0);
    const completionPercent =
      totalTasks > 0
        ? Math.round(ctx.tasks.reduce((sum, t) => sum + (Number(t.progress) || 0), 0) / totalTasks)
        : 0;

    return {
      totalTasks,
      completedTasks,
      atRiskTasks,
      inProgressTasks,
      milestonesCount,
      completionPercent,
      totalEstimatedCost,
      phases: Object.keys(tasksByPhase),
    };
  }, [ctx.tasks, tasksByPhase]);

  return {
    ...ctx,
    projectStats,
    tasksByPhase,
  };
}
