import React from 'react';
import { motion } from 'motion/react';
import { Card } from '../ui/card';
import { WORKFLOW_STEPS } from '../../lib/workflowTypes';
import { ArrowRight, CheckCircle, Circle } from 'lucide-react';

interface WorkflowDiagramProps {
  currentStep?: string;
  className?: string;
}

export const WorkflowDiagram: React.FC<WorkflowDiagramProps> = ({ currentStep, className }) => {
  const getCurrentStepOrder = () => {
    if (!currentStep) return -1;
    const step = WORKFLOW_STEPS.find(s => s.step === currentStep);
    return step ? step.order : -1;
  };

  const currentOrder = getCurrentStepOrder();

  return (
    <Card className={`p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-gray-200 dark:border-slate-700 ${className}`}>
      <h3 className="text-gray-900 dark:text-white mb-6">Procurement Approval Workflow</h3>
      
      <div className="space-y-2">
        {WORKFLOW_STEPS.slice(1, -1).map((step, index) => {
          const isCompleted = currentOrder > step.order;
          const isCurrent = currentOrder === step.order;
          const isPending = currentOrder < step.order;

          return (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative"
            >
              <div
                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                  isCompleted
                    ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-l-green-500'
                    : isCurrent
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500 shadow-md'
                    : 'bg-gray-50 dark:bg-slate-700 border-l-4 border-l-gray-300 dark:border-l-slate-600'
                }`}
              >
                <div className="shrink-0">
                  {isCompleted ? (
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  ) : isCurrent ? (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <Circle className="h-6 w-6 text-blue-600 dark:text-blue-400 fill-current" />
                    </motion.div>
                  ) : (
                    <Circle className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-sm ${
                        isCompleted
                          ? 'text-green-900 dark:text-green-100'
                          : isCurrent
                          ? 'text-blue-900 dark:text-blue-100'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
                        Step {step.order}
                      </span>
                      {step.label}
                    </p>
                  </div>
                </div>

                {isCurrent && (
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <ArrowRight className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </motion.div>
                )}
              </div>

              {index < WORKFLOW_STEPS.length - 3 && (
                <div className="ml-6 h-4 w-0.5 bg-gray-200 dark:bg-slate-600" />
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-xl">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-gray-700 dark:text-gray-300">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <Circle className="h-4 w-4 text-blue-600 dark:text-blue-400 fill-current" />
            <span className="text-gray-700 dark:text-gray-300">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <Circle className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            <span className="text-gray-700 dark:text-gray-300">Pending</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
