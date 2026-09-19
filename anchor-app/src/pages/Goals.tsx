import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, CheckCircle2, Circle, Leaf } from 'lucide-react';
import { useVault } from '../context/VaultContext';
import { getGoals, saveGoal, deleteGoal } from '../vault/db';
import type { GoalEntry } from '../vault/db';

export function Goals() {
  const { cryptoKey } = useVault();
  const [goals, setGoals] = useState<GoalEntry[]>([]);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => { loadData(); }, [cryptoKey]);

  async function loadData() {
    if (!cryptoKey) return;
    const loaded = await getGoals(cryptoKey);
    setGoals(loaded.sort((a, b) => b.timestamp - a.timestamp));
  }

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cryptoKey || !newGoalTitle.trim()) return;
    setIsAdding(true);
    try {
      await saveGoal({ id: crypto.randomUUID(), title: newGoalTitle.trim(), completed: false, timestamp: Date.now(), description: '' }, cryptoKey);
      setNewGoalTitle('');
      await loadData();
    } finally { setIsAdding(false); }
  };

  const toggleGoal = async (goal: GoalEntry) => {
    if (!cryptoKey) return;
    await saveGoal({ ...goal, completed: !goal.completed }, cryptoKey);
    await loadData();
  };

  const removeGoal = async (id: string) => {
    if (!cryptoKey) return;
    await deleteGoal(id);
    await loadData();
  };

  const activeGoals = goals.filter(g => !g.completed);
  const completedGoals = goals.filter(g => g.completed);

  return (
    <div className="flex-1 w-full max-w-[900px] mx-auto px-4 md:px-16 pb-24">
      <header className="h-[86px] flex items-center border-b" style={{ borderColor: 'var(--line)' }}>
        <span className="eyebrow">My space <span className="mx-2" style={{ color: '#c2cac2' }}>/</span> Goals</span>
      </header>

      <div className="py-10">
        <p className="eyebrow mb-2">YOUR MILESTONES</p>
        <h1 className="serif-heading text-[clamp(36px,5vw,56px)]">
          Quiet <em>milestones.</em>
        </h1>
        <p className="mt-3 text-sm" style={{ color: '#859088' }}>No streaks. Just honest progress, one step at a time.</p>
      </div>

      {/* Add Goal */}
      <form onSubmit={handleAddGoal} className="flex gap-2 mb-8">
        <input
          type="text"
          placeholder="What's a small milestone for this week?"
          value={newGoalTitle}
          onChange={(e) => setNewGoalTitle(e.target.value)}
          disabled={isAdding}
          className="flex-1 px-4 py-3 text-sm border rounded-sm outline-none focus:border-[#8fb392]"
          style={{ background: 'var(--paper)', borderColor: 'var(--line)', color: 'var(--ink)' }}
        />
        <button type="submit" disabled={isAdding || !newGoalTitle.trim()} className="px-4 py-3 text-xs font-semibold text-white rounded-sm disabled:opacity-50" style={{ background: 'var(--green)' }}>
          <Plus size={16} />
        </button>
      </form>

      {/* Active */}
      <div className="space-y-3 mb-10">
        <p className="eyebrow mb-3">IN PROGRESS</p>
        {activeGoals.length === 0 ? (
          <div className="text-center py-8 rounded-sm border border-dashed" style={{ borderColor: 'var(--line)', color: '#8b958d' }}>
            <p className="text-sm">No active goals. Set a small intention for today.</p>
          </div>
        ) : (
          activeGoals.map(goal => (
            <motion.div key={goal.id} layout className="flex items-center gap-3 p-4 rounded-sm border transition-colors hover:border-[var(--green)]" style={{ background: 'var(--paper)', borderColor: 'var(--line)' }}>
              <button onClick={() => toggleGoal(goal)} style={{ color: '#9ba49d' }} className="hover:text-[var(--green)] transition-colors"><Circle size={22} /></button>
              <span className="flex-1 font-medium text-sm">{goal.title}</span>
              <button onClick={() => removeGoal(goal.id)} className="text-xs" style={{ color: '#c9a49a' }}>Remove</button>
            </motion.div>
          ))
        )}
      </div>

      {/* Completed */}
      {completedGoals.length > 0 && (
        <div className="space-y-3 opacity-70">
          <p className="eyebrow mb-3 flex items-center gap-2"><CheckCircle2 size={14} /> COMPLETED</p>
          {completedGoals.map(goal => (
            <motion.div key={goal.id} layout className="flex items-center gap-3 p-4 rounded-sm border" style={{ background: '#f3faf1', borderColor: '#dcebd9' }}>
              <button onClick={() => toggleGoal(goal)} style={{ color: 'var(--green)' }}><CheckCircle2 size={22} /></button>
              <span className="flex-1 text-sm line-through" style={{ color: '#9ba49d' }}>{goal.title}</span>
              <button onClick={() => removeGoal(goal.id)} className="text-xs" style={{ color: '#c9a49a' }}>Remove</button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
