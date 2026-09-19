import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Plus, CheckCircle2, Circle } from 'lucide-react';
import { useVault } from '../context/VaultContext';
import { getGoals, saveGoal, deleteGoal } from '../vault/db';
import type { GoalEntry } from '../vault/db';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Goals() {
  const { cryptoKey } = useVault();
  const [goals, setGoals] = useState<GoalEntry[]>([]);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    loadData();
  }, [cryptoKey]);

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
      await saveGoal({
        id: crypto.randomUUID(),
        title: newGoalTitle.trim(),
        completed: false,
        timestamp: Date.now(),
        description: ''
      }, cryptoKey);
      setNewGoalTitle('');
      await loadData();
    } finally {
      setIsAdding(false);
    }
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
    <div className="flex-1 w-full max-w-3xl mx-auto p-4 md:p-8 space-y-6 pb-24">
      <header className="flex items-center justify-between pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Target className="w-8 h-8 text-emerald-600" />
            Goals
          </h1>
          <p className="text-muted-foreground mt-1">Focus on what matters this season.</p>
        </div>
      </header>

      {/* Add Goal Form */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleAddGoal} className="flex gap-2">
            <Input 
              placeholder="What's a small milestone for this week?" 
              value={newGoalTitle}
              onChange={(e) => setNewGoalTitle(e.target.value)}
              disabled={isAdding}
              className="flex-1"
            />
            <Button type="submit" disabled={isAdding || !newGoalTitle.trim()}>
              <Plus className="w-5 h-5 mr-1" /> Add
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Active Goals */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">In Progress</h3>
        {activeGoals.length === 0 ? (
          <p className="text-muted-foreground text-sm py-4 text-center bg-muted/20 rounded-md border border-dashed">
            No active goals. Set a small intention for today.
          </p>
        ) : (
          activeGoals.map(goal => (
            <motion.div key={goal.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="hover:border-primary/50 transition-colors">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button onClick={() => toggleGoal(goal)} className="text-muted-foreground hover:text-emerald-500 transition-colors">
                      <Circle className="w-6 h-6" />
                    </button>
                    <span className="font-medium text-lg">{goal.title}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeGoal(goal.id)} className="text-destructive/50 hover:text-destructive">
                    Remove
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div className="space-y-3 pt-6">
          <h3 className="text-lg font-semibold text-muted-foreground flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Completed
          </h3>
          <div className="opacity-70">
            {completedGoals.map(goal => (
              <motion.div key={goal.id} layout>
                <Card className="mb-3 bg-muted/30">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button onClick={() => toggleGoal(goal)} className="text-emerald-500">
                        <CheckCircle2 className="w-6 h-6" />
                      </button>
                      <span className="font-medium line-through text-muted-foreground">{goal.title}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeGoal(goal.id)} className="text-destructive/50 hover:text-destructive">
                      Remove
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
