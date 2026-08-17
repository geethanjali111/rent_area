import React, { useState } from 'react';
import { 
  X, 
  Play, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  ShieldCheck, 
  Lock, 
  Sparkles, 
  Clock, 
  Layers, 
  Database,
  ArrowRight
} from 'lucide-react';
import { api } from '../lib/api';

interface AutomatedTestModalProps {
  onClose: () => void;
  onRefreshAppState: () => Promise<void>;
}

export const AutomatedTestModal: React.FC<AutomatedTestModalProps> = ({
  onClose,
  onRefreshAppState
}) => {
  const [running, setRunning] = useState(false);
  const [testResults, setTestResults] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'tests' | 'lifecycle'>('tests');

  // Lifecycle Simulation State
  const [lifecycleRunning, setLifecycleRunning] = useState(false);
  const [lifecycleResult, setLifecycleResult] = useState<any | null>(null);

  const handleRunTests = async () => {
    setRunning(true);
    try {
      const data = await api.runRegressionTests();
      setTestResults(data);
      await onRefreshAppState();
    } catch (err: any) {
      alert(err.message || 'Failed to execute test suite');
    } finally {
      setRunning(false);
    }
  };

  const handleRunLifecycle = async () => {
    setLifecycleRunning(true);
    try {
      const data = await api.runFullLifecycle();
      setLifecycleResult(data);
      await onRefreshAppState();
    } catch (err: any) {
      alert(err.message || 'Failed to run lifecycle simulation');
    } finally {
      setLifecycleRunning(false);
    }
  };

  return (
    <div id="automated-tests-modal" className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">Platform Integrity & Security Diagnostics</h2>
              <p className="text-xs text-slate-400">Automated end-to-end database, RBAC, and lifecycle verification</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50">
          <button
            onClick={() => setActiveTab('tests')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'tests'
                ? 'border-slate-900 text-slate-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            11-Suite Security & Logic Tests
          </button>

          <button
            onClick={() => setActiveTab('lifecycle')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'lifecycle'
                ? 'border-slate-900 text-slate-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            12-Step Tenancy Lifecycle Walkthrough
          </button>
        </div>

        {/* Modal Scroll Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: REGRESSION TESTS */}
          {activeTab === 'tests' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Execute Real Platform Tests</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Validates RBAC isolation, illegal Cross-User access prevention, JSON-file persistence, and financial invariants.
                  </p>
                </div>

                <button
                  onClick={handleRunTests}
                  disabled={running}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
                >
                  {running ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                      <span>Executing 11 Test Suites...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 text-emerald-400 fill-current" />
                      <span>Run All Diagnostic Suites</span>
                    </>
                  )}
                </button>
              </div>

              {/* Test Results Display */}
              {testResults && (
                <div className="space-y-4">
                  {/* Summary Banner */}
                  <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                    testResults.summary.failed === 0
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                      : 'bg-rose-50 border-rose-200 text-rose-950'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      {testResults.summary.failed === 0 ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
                      )}
                      <div>
                        <h4 className="text-sm font-extrabold">
                          {testResults.summary.passed} of {testResults.summary.total} Suites Passed ({testResults.summary.durationMs}ms)
                        </h4>
                        <p className="text-xs opacity-90">
                          {testResults.summary.failed === 0 ? 'All database, authorization, and workflow assertions 100% verified.' : 'Some suites encountered failures.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Individual Suites Grid */}
                  <div className="space-y-2.5">
                    {testResults.suites.map((suite: any, i: number) => (
                      <div
                        key={i}
                        className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
                          suite.passed ? 'bg-white border-slate-200' : 'bg-rose-50 border-rose-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {suite.passed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          )}
                          <div>
                            <strong className="text-slate-900 font-bold block">{suite.name}</strong>
                            <p className="text-slate-500 text-[11px]">{suite.details}</p>
                          </div>
                        </div>

                        <span className="text-[10px] font-mono text-slate-400 shrink-0 font-medium">
                          {suite.durationMs}ms
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LIFECYCLE SIMULATION */}
          {activeTab === 'lifecycle' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Execute 12-Step Lifecycle Simulation</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Live simulation: Property Creation → Admin Verification → Tour Schedule → Application Underwriting → Lease Signing → Rent Settlement → Maintenance Ticket Resolution.
                  </p>
                </div>

                <button
                  onClick={handleRunLifecycle}
                  disabled={lifecycleRunning}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
                >
                  {lifecycleRunning ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                      <span>Simulating 12 Steps...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Run 12-Step Demo Walkthrough</span>
                    </>
                  )}
                </button>
              </div>

              {lifecycleResult && (
                <div className="space-y-3">
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-950 flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                    <div>
                      <h4 className="text-sm font-extrabold">Complete 12-Step Lifecycle Successfully Executed!</h4>
                      <p className="text-xs text-emerald-800 mt-0.5">
                        Created test property, issued verifications, processed applications, signed digital leases, and escrowed funds.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {lifecycleResult.steps.map((step: any) => (
                      <div
                        key={step.step}
                        className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">
                            {step.step}
                          </span>
                          <div>
                            <strong className="text-slate-900 font-bold block">{step.name}</strong>
                            <p className="text-slate-500 text-[11px]">{step.details}</p>
                          </div>
                        </div>

                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Step Verified
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
          >
            Close Diagnostics
          </button>
        </div>

      </div>
    </div>
  );
};
