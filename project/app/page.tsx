'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Target, Focus, Rocket, Book, Users, Lightbulb, Clock, Zap, Repeat } from 'lucide-react';
import { useEffect, useState } from 'react';

const principles = [
  {
    id: 'metalearning',
    name: 'Metalearning',
    icon: Brain,
    questions: [
      'Have you researched the most effective learning methods for your subject?',
      'Have you identified key concepts and skills required?',
      'Have you gathered necessary learning resources?',
      'Have you created a structured learning roadmap?'
    ]
  },
  {
    id: 'focus',
    name: 'Focus',
    icon: Target,
    questions: [
      'Have you set up a distraction-free learning environment?',
      'Have you scheduled dedicated deep work sessions?',
      'Are you tracking your focus levels?',
      'Have you identified your peak productivity hours?'
    ]
  },
  {
    id: 'directness',
    name: 'Directness',
    icon: Rocket,
    questions: [
      'Are you practicing with real-world examples?',
      'Have you identified practical projects to work on?',
      'Are you applying concepts as you learn them?',
      'Are you seeking feedback on your work?'
    ]
  },
  {
    id: 'drill',
    name: 'Drill',
    icon: Zap,
    questions: [
      'Have you identified your weak points?',
      'Have you created specific exercises to address them?',
      'Are you practicing deliberately with focused repetition?',
      'Are you measuring improvement in problem areas?'
    ]
  },
  {
    id: 'retrieval',
    name: 'Retrieval',
    icon: Repeat,
    questions: [
      'Are you testing yourself on learned material?',
      'Have you created flashcards for key concepts?',
      'Are you practicing active recall regularly?',
      'Are you spacing out your review sessions?'
    ]
  },
  {
    id: 'feedback',
    name: 'Feedback',
    icon: Users,
    questions: [
      'Are you seeking feedback from mentors/experts?',
      'Have you joined a community of learners?',
      'Are you documenting and analyzing your mistakes?',
      'Are you adjusting your approach based on feedback?'
    ]
  }
];

export default function Home() {
  const [completedSteps, setCompletedSteps] = useState<Record<string, Set<number>>>({});
  const [activeTab, setActiveTab] = useState('metalearning');

  // Load progress from localStorage on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem('ultralearn-progress');
    if (savedProgress) {
      const parsed = JSON.parse(savedProgress);
      // Convert the arrays back to Sets
      const converted = Object.fromEntries(
        Object.entries(parsed).map(([key, value]) => [key, new Set(value)])
      );
      setCompletedSteps(converted);
    }
  }, []);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    // Convert Sets to arrays for JSON serialization
    const serializable = Object.fromEntries(
      Object.entries(completedSteps).map(([key, value]) => [key, Array.from(value)])
    );
    localStorage.setItem('ultralearn-progress', JSON.stringify(serializable));
  }, [completedSteps]);

  const toggleStep = (principleId: string, questionIndex: number) => {
    setCompletedSteps(prev => {
      const newCompleted = new Set(prev[principleId] || new Set());
      if (newCompleted.has(questionIndex)) {
        newCompleted.delete(questionIndex);
      } else {
        newCompleted.add(questionIndex);
      }
      return { ...prev, [principleId]: newCompleted };
    });
  };

  const getProgress = (principleId: string) => {
    const completed = completedSteps[principleId]?.size || 0;
    const total = principles.find(p => p.id === principleId)?.questions.length || 1;
    return (completed / total) * 100;
  };

  const totalProgress = () => {
    const totalCompleted = Object.values(completedSteps).reduce(
      (sum, set) => sum + set.size,
      0
    );
    const totalQuestions = principles.reduce(
      (sum, principle) => sum + principle.questions.length,
      0
    );
    return (totalCompleted / totalQuestions) * 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">UltraLearn Tracker</h1>
          <p className="text-lg text-muted-foreground">
            Track Your Ultralearning Journey, One Step at a Time
          </p>
          <div className="w-full max-w-md mx-auto">
            <Progress value={totalProgress()} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              Overall Progress: {Math.round(totalProgress())}%
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {principles.map((principle) => {
            const progress = getProgress(principle.id);
            const Icon = principle.icon;
            return (
              <Card key={principle.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setActiveTab(principle.id)}>
                <div className="flex items-center gap-3 mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                  <h2 className="font-semibold">{principle.name}</h2>
                </div>
                <Progress value={progress} className="mb-2" />
                <p className="text-sm text-muted-foreground">
                  {Math.round(progress)}% Complete
                </p>
              </Card>
            );
          })}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-8">
            {principles.map((principle) => {
              const PrincipleIcon = principle.icon;
              return (
                <TabsTrigger key={principle.id} value={principle.id}>
                  <span className="hidden md:inline">{principle.name}</span>
                  <PrincipleIcon className="w-4 h-4 md:hidden" />
                </TabsTrigger>
              );
            })}
          </TabsList>

          {principles.map((principle) => (
            <TabsContent key={principle.id} value={principle.id}>
              <Card>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-4">{principle.name} Checklist</h3>
                  <div className="space-y-4">
                    {principle.questions.map((question, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-4 p-4 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <Button
                          variant={completedSteps[principle.id]?.has(index) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleStep(principle.id, index)}
                          className="shrink-0"
                        >
                          {completedSteps[principle.id]?.has(index) ? "✓" : " "}
                        </Button>
                        <p className="text-sm">{question}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}