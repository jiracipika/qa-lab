/** Diagram registry: id -> interactive component. Lessons reference diagrams by id. */

import type { ComponentType } from "react";
import { ErrorDefectFailureDiagram, TestProcessDiagram, DefectWorkflowDiagram, TestLevelsDiagram } from "./Diagrams1";
import { BoundaryValuesDiagram, DecisionTableDiagram, StateTransitionsDiagram } from "./Diagrams2";
import { ApiFlowDiagram, CiPipelineDiagram } from "./Diagrams3";

export interface DiagramEntry {
  id: string;
  title: string;
  component: ComponentType;
}

export const diagrams: DiagramEntry[] = [
  { id: "err-defect-failure", title: "Interactive: the error -> defect -> failure chain", component: ErrorDefectFailureDiagram },
  { id: "test-process", title: "Interactive: test activities and feedback loops", component: TestProcessDiagram },
  { id: "defect-workflow", title: "Interactive: an example defect workflow", component: DefectWorkflowDiagram },
  { id: "test-levels", title: "Interactive: test levels", component: TestLevelsDiagram },
  { id: "boundary-values", title: "Interactive: boundary values on a number line", component: BoundaryValuesDiagram },
  { id: "decision-table", title: "Interactive: decision table rules", component: DecisionTableDiagram },
  { id: "state-transitions", title: "Interactive: state transition machine", component: StateTransitionsDiagram },
  { id: "api-request-flow", title: "Interactive: API request and response flow", component: ApiFlowDiagram },
  { id: "ci-pipeline", title: "Interactive: CI/CD pipeline quality gates", component: CiPipelineDiagram },
];

export function getDiagram(id: string): DiagramEntry | undefined {
  return diagrams.find((d) => d.id === id);
}
