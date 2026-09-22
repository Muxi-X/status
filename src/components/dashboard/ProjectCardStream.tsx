'use client';

import React from 'react';
import clsx from 'clsx';
import { useProjects } from '@/hooks/use-projects';
import { useSelectedProject } from '@/context/ProjectContext';
import { ProjectCard } from './ProjectCard';

export interface ProjectCardStreamProps {
  className?: string;
}

export function ProjectCardStream({ className }: ProjectCardStreamProps) {
  const projects = useProjects();
  const { selectedProjectId, setSelectedProjectId } = useSelectedProject();

  return (
    <section
      aria-label="Active Projects Fleet"
      className={clsx('col-span-1 md:col-span-6 xl:col-span-12 w-full', className)}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
          <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)]">
            Project Fleet
          </h2>
        </div>
        <span className="font-mono text-[10px] tabular-nums text-[var(--text-muted)]">
          {projects.length} {projects.length === 1 ? 'REPO' : 'REPOS'} ACTIVE
        </span>
      </div>

      <div className="custom-scrollbar flex w-full gap-3 overflow-x-auto pb-1 pt-0.5">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            isSelected={project.id === selectedProjectId}
            onSelect={setSelectedProjectId}
          />
        ))}
      </div>
    </section>
  );
}
