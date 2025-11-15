import React from 'react';
import { motion } from 'motion/react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { WorkflowDiagram } from '../components/workflow/WorkflowDiagram';
import { 
  Users, 
  FileText, 
  GitBranch, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Shield,
  Zap
} from 'lucide-react';
import { WORKFLOW_STEPS } from '../lib/workflowTypes';

export const SystemOverview: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <GitBranch className="h-6 w-6" />,
      title: '12-Step Workflow',
      description: 'Comprehensive multi-level approval process ensuring accountability at every stage',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: 'E-Signatures',
      description: 'Draw, upload, or type digital signatures for all approvals',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: <CheckCircle2 className="h-6 w-6" />,
      title: 'Document Tracking',
      description: 'Attach and track documents at each workflow stage',
      color: 'from-green-500 to-green-600',
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: '8 User Roles',
      description: 'Faculty, HOD, Store Officer, Purchase Officer, Principal, Payment Officer, Accountant, Admin',
      color: 'from-orange-500 to-orange-600',
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: 'Modern UI/UX',
      description: 'Smooth animations, dark mode, responsive design, and micro-interactions',
      color: 'from-pink-500 to-pink-600',
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Audit Trail',
      description: 'Complete history of all actions, comments, and decisions',
      color: 'from-teal-500 to-teal-600',
    },
  ];

  const roles = [
    { name: 'Faculty', desc: 'Create requests', steps: 1 },
    { name: 'HOD', desc: 'Department approval', steps: 2 },
    { name: 'Store Officer', desc: 'Inventory verification', steps: 3 },
    { name: 'Purchase Officer', desc: 'Procurement processing', steps: 2 },
    { name: 'Principal', desc: 'Executive approval', steps: 2 },
    { name: 'Payment Officer', desc: 'Financial approval', steps: 1 },
    { name: 'Accountant Officer', desc: 'Final review', steps: 1 },
    { name: 'Admin', desc: 'Full system access', steps: 0 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto"
    >
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Badge className="mb-4 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            Production-Ready System
          </Badge>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-gray-900 dark:text-white mb-4"
        >
          Procurement Management System
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto"
        >
          Complete multi-level approval workflow with e-signatures, document management, 
          and real-time tracking. Built with React, TypeScript, Tailwind CSS, and Framer Motion.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex gap-4 justify-center"
        >
          <Button
            onClick={() => navigate('/create')}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-xl px-8"
          >
            <Zap className="h-5 w-5 mr-2" />
            Try It Now
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/requests')}
            className="rounded-xl px-8"
          >
            View Demo Data
          </Button>
        </motion.div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <Card className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-gray-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300">
              <div className={`bg-gradient-to-br ${feature.color} p-3 rounded-2xl w-fit mb-4 text-white`}>
                {feature.icon}
              </div>
              <h3 className="text-gray-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Workflow Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        <WorkflowDiagram />

        <Card className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-gray-200 dark:border-slate-700">
          <h3 className="text-gray-900 dark:text-white mb-6">User Roles & Responsibilities</h3>
          <div className="space-y-3">
            {roles.map((role, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * index }}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-xl"
              >
                <div>
                  <p className="text-gray-900 dark:text-white">{role.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{role.desc}</p>
                </div>
                {role.steps > 0 && (
                  <Badge variant="outline" className="dark:border-slate-600">
                    {role.steps} {role.steps === 1 ? 'step' : 'steps'}
                  </Badge>
                )}
              </motion.div>
            ))}
          </div>
        </Card>
      </div>

      {/* Workflow Steps Detail */}
      <Card className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl shadow-lg border-blue-200 dark:border-slate-600 mb-12">
        <h2 className="text-gray-900 dark:text-white mb-6 text-center">Complete Workflow Sequence</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {WORKFLOW_STEPS.slice(1, -1).map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 * index }}
              className="text-center"
            >
              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-md border border-gray-200 dark:border-slate-700">
                <div className="bg-blue-100 dark:bg-blue-900/30 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 dark:text-blue-400">{step.order}</span>
                </div>
                <p className="text-xs text-gray-900 dark:text-white">{step.label}</p>
              </div>
              {index < WORKFLOW_STEPS.length - 3 && (
                <div className="hidden md:block mt-4">
                  <ArrowRight className="h-4 w-4 text-blue-600 dark:text-blue-400 mx-auto" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Key Actions */}
      <Card className="p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-gray-200 dark:border-slate-700 mb-12">
        <h2 className="text-gray-900 dark:text-white mb-6">Available Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border-2 border-green-200 dark:border-green-700">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400 mb-3" />
            <h3 className="text-gray-900 dark:text-white mb-2">Approve & Forward</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Move to next step</li>
              <li>• Requires e-signature</li>
              <li>• Optional comment</li>
              <li>• Attach documents</li>
            </ul>
          </div>

          <div className="p-6 bg-orange-50 dark:bg-orange-900/20 rounded-xl border-2 border-orange-200 dark:border-orange-700">
            <ArrowRight className="h-8 w-8 text-orange-600 dark:text-orange-400 mb-3 rotate-180" />
            <h3 className="text-gray-900 dark:text-white mb-2">Return to Previous</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Send back one step</li>
              <li>• Mandatory comment</li>
              <li>• Explain reason</li>
              <li>• Attach documents</li>
            </ul>
          </div>

          <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-700">
            <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-3" />
            <h3 className="text-gray-900 dark:text-white mb-2">Add Comment</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• No workflow change</li>
              <li>• Provide feedback</li>
              <li>• Visible to all</li>
              <li>• Timestamped</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Technical Stack */}
      <Card className="p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-gray-200 dark:border-slate-700">
        <h2 className="text-gray-900 dark:text-white mb-6">Technical Stack</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'React 18', desc: 'UI Framework' },
            { name: 'TypeScript', desc: 'Type Safety' },
            { name: 'Tailwind CSS', desc: 'Styling' },
            { name: 'Framer Motion', desc: 'Animations' },
            { name: 'IndexedDB', desc: 'Data Storage' },
            { name: 'React Router', desc: 'Navigation' },
            { name: 'shadcn/ui', desc: 'Components' },
            { name: 'Vite', desc: 'Build Tool' },
          ].map((tech, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
              className="p-4 bg-gray-50 dark:bg-slate-700 rounded-xl text-center"
            >
              <p className="text-gray-900 dark:text-white mb-1">{tech.name}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{tech.desc}</p>
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
};
