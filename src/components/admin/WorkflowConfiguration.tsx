import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { ArrowRight, Settings, GripVertical, CheckCircle, FileSignature } from 'lucide-react';
import { WorkflowStep, UserRole, DEFAULT_WORKFLOW_STEPS } from '../../lib/adminTypes';
import { toast } from 'sonner@2.0.3';
import { auditService } from '../../lib/auditService';

interface WorkflowConfigurationProps {
  currentUserId: string;
  currentUserRole: UserRole;
}

export const WorkflowConfiguration: React.FC<WorkflowConfigurationProps> = ({
  currentUserId,
  currentUserRole,
}) => {
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>(DEFAULT_WORKFLOW_STEPS);
  const [isDirty, setIsDirty] = useState(false);

  const handleToggleDocuments = (index: number) => {
    const updated = [...workflowSteps];
    updated[index].canAttachDocuments = !updated[index].canAttachDocuments;
    setWorkflowSteps(updated);
    setIsDirty(true);
  };

  const handleToggleSignature = (index: number) => {
    const updated = [...workflowSteps];
    updated[index].requiresSignature = !updated[index].requiresSignature;
    setWorkflowSteps(updated);
    setIsDirty(true);
  };

  const handleToggleAutoAdvance = (index: number) => {
    const updated = [...workflowSteps];
    updated[index].autoAdvance = !updated[index].autoAdvance;
    setWorkflowSteps(updated);
    setIsDirty(true);
  };

  const handleSave = async () => {
    await auditService.log(
      'config_changed',
      currentUserId,
      'Admin',
      currentUserRole,
      {
        configKey: 'workflow_steps',
        beforeValue: DEFAULT_WORKFLOW_STEPS,
        afterValue: workflowSteps,
      },
      'info'
    );

    toast.success('Workflow configuration saved successfully');
    setIsDirty(false);
  };

  const handleReset = () => {
    setWorkflowSteps(DEFAULT_WORKFLOW_STEPS);
    setIsDirty(false);
    toast.success('Workflow configuration reset to defaults');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 dark:text-white">Workflow Configuration</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure the 12-step approval workflow
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} disabled={!isDirty}>
            Reset to Default
          </Button>
          <Button onClick={handleSave} disabled={!isDirty}>
            Save Changes
          </Button>
        </div>
      </div>

      {/* Workflow Steps */}
      <Card className="p-6">
        <div className="space-y-4">
          {workflowSteps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative"
            >
              <div className="flex items-center gap-4 p-4 border rounded-xl hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                {/* Drag Handle */}
                <div className="flex items-center gap-3">
                  <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm">
                    {step.order}
                  </div>
                </div>

                {/* Step Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-gray-900 dark:text-white">{step.roleName}</h4>
                    <Badge variant="outline">{step.role}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    {step.canAttachDocuments && (
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        Can attach documents
                      </span>
                    )}
                    {step.requiresSignature && (
                      <span className="flex items-center gap-1">
                        <FileSignature className="h-3 w-3 text-blue-600" />
                        Requires signature
                      </span>
                    )}
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={step.canAttachDocuments}
                      onCheckedChange={() => handleToggleDocuments(index)}
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Documents</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={step.requiresSignature}
                      onCheckedChange={() => handleToggleSignature(index)}
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Signature</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={step.autoAdvance}
                      onCheckedChange={() => handleToggleAutoAdvance(index)}
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Auto-advance</span>
                  </div>
                </div>
              </div>

              {/* Arrow between steps */}
              {index < workflowSteps.length - 1 && (
                <div className="flex justify-center my-2">
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Info Card */}
      <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <div className="flex gap-4">
          <Settings className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-blue-900 dark:text-blue-100 mb-2">Configuration Notes</h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• The workflow order is fixed and cannot be changed in the current version</li>
              <li>• Documents: Allow the role to attach files during approval</li>
              <li>• Signature: Require e-signature before approving</li>
              <li>• Auto-advance: Automatically move to next step after approval (not recommended)</li>
              <li>• Changes will affect all new requests created after saving</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};
