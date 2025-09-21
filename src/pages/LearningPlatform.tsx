import React, { useState } from "react";
import { motion } from "framer-motion";
import { Flag, Trophy, Medal, Calculator, BookOpen, Target, TrendingUp, LineChart, MapPin, Shapes, PieChart, Zap } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ModuleNode {
  id: string;
  title: string;
  type: 'start' | 'module' | 'checkpoint' | 'final';
  icon: React.ReactNode;
  dueDate: string;
  isUnlocked: boolean;
  position: { x: number; y: number };
}

const LearningPlatform = () => {
  // Calculate dates from today to May 29, 2026
  const startDate = new Date();
  const endDate = new Date('2026-05-29');
  const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const formatDate = (daysFromNow: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'long'
    });
  };

  const modules: ModuleNode[] = [
    {
      id: 'start',
      title: 'Старт',
      type: 'start',
      icon: <Flag className="h-6 w-6" />,
      dueDate: formatDate(0),
      isUnlocked: true,
      position: { x: 10, y: 20 }
    },
    {
      id: 'module-1',
      title: 'Числа и вычисления',
      type: 'module',
      icon: <Calculator className="h-6 w-6" />,
      dueDate: formatDate(Math.floor(totalDays * 0.1)),
      isUnlocked: true,
      position: { x: 25, y: 35 }
    },
    {
      id: 'module-2',
      title: 'Алгебраические выражения',
      type: 'module',
      icon: <BookOpen className="h-6 w-6" />,
      dueDate: formatDate(Math.floor(totalDays * 0.2)),
      isUnlocked: false,
      position: { x: 40, y: 15 }
    },
    {
      id: 'module-3',
      title: 'Уравнения и неравенства',
      type: 'module',
      icon: <Target className="h-6 w-6" />,
      dueDate: formatDate(Math.floor(totalDays * 0.3)),
      isUnlocked: false,
      position: { x: 55, y: 40 }
    },
    {
      id: 'checkpoint-1',
      title: 'ОГЭ Симуляция',
      type: 'checkpoint',
      icon: <Medal className="h-6 w-6" />,
      dueDate: formatDate(Math.floor(totalDays * 0.35)),
      isUnlocked: false,
      position: { x: 70, y: 25 }
    },
    {
      id: 'module-4',
      title: 'Числовые последовательности',
      type: 'module',
      icon: <TrendingUp className="h-6 w-6" />,
      dueDate: formatDate(Math.floor(totalDays * 0.4)),
      isUnlocked: false,
      position: { x: 80, y: 50 }
    },
    {
      id: 'module-5',
      title: 'Функции',
      type: 'module',
      icon: <LineChart className="h-6 w-6" />,
      dueDate: formatDate(Math.floor(totalDays * 0.5)),
      isUnlocked: false,
      position: { x: 85, y: 15 }
    },
    {
      id: 'module-6',
      title: 'Координаты на прямой и плоскости',
      type: 'module',
      icon: <MapPin className="h-6 w-6" />,
      dueDate: formatDate(Math.floor(totalDays * 0.6)),
      isUnlocked: false,
      position: { x: 75, y: 65 }
    },
    {
      id: 'checkpoint-2',
      title: 'ОГЭ Симуляция',
      type: 'checkpoint',
      icon: <Medal className="h-6 w-6" />,
      dueDate: formatDate(Math.floor(totalDays * 0.65)),
      isUnlocked: false,
      position: { x: 60, y: 70 }
    },
    {
      id: 'module-7',
      title: 'Геометрия',
      type: 'module',
      icon: <Shapes className="h-6 w-6" />,
      dueDate: formatDate(Math.floor(totalDays * 0.7)),
      isUnlocked: false,
      position: { x: 40, y: 75 }
    },
    {
      id: 'module-8',
      title: 'Вероятность и статистика',
      type: 'module',
      icon: <PieChart className="h-6 w-6" />,
      dueDate: formatDate(Math.floor(totalDays * 0.8)),
      isUnlocked: false,
      position: { x: 25, y: 60 }
    },
    {
      id: 'module-9',
      title: 'Применение математики к прикладным задачам',
      type: 'module',
      icon: <Zap className="h-6 w-6" />,
      dueDate: formatDate(Math.floor(totalDays * 0.9)),
      isUnlocked: false,
      position: { x: 15, y: 80 }
    },
    {
      id: 'final',
      title: 'Ты готов к ОГЭ!',
      type: 'final',
      icon: <Trophy className="h-6 w-6" />,
      dueDate: '29 мая 2026',
      isUnlocked: false,
      position: { x: 50, y: 90 }
    }
  ];

  const getNodeColor = (node: ModuleNode, isHovered: boolean) => {
    if (node.type === 'start') return 'from-green-400 to-green-600';
    if (node.type === 'final') return 'from-purple-400 to-purple-600';
    if (node.type === 'checkpoint') return 'from-orange-400 to-orange-600';
    if (node.isUnlocked) return 'from-blue-400 to-blue-600';
    return 'from-gray-300 to-gray-500';
  };

  const PathLine = ({ from, to }: { from: ModuleNode; to: ModuleNode }) => {
    const x1 = from.position.x;
    const y1 = from.position.y;
    const x2 = to.position.x;
    const y2 = to.position.y;
    
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    
    // Create a smooth curve
    const curve = `M ${x1} ${y1} Q ${midX + (Math.random() - 0.5) * 10} ${midY + (Math.random() - 0.5) * 10} ${x2} ${y2}`;
    
    return (
      <path
        d={curve}
        stroke="currentColor"
        strokeWidth="3"
        strokeDasharray="10,5"
        fill="none"
        className="text-gray-400"
      />
    );
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Твой путь к успеху в ОГЭ
            </h1>
            <p className="text-lg text-gray-600">
              Игровая карта обучения • Следуй по пути и достигай целей
            </p>
          </motion.div>

          {/* Course Map */}
          <div className="relative w-full h-[600px] mx-auto">
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Draw connecting paths */}
              {modules.slice(0, -1).map((module, index) => (
                <PathLine
                  key={`path-${index}`}
                  from={module}
                  to={modules[index + 1]}
                />
              ))}
            </svg>

            {/* Module Nodes */}
            {modules.map((module, index) => (
              <Tooltip key={module.id}>
                <TooltipTrigger asChild>
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ 
                      scale: 1.2, 
                      y: -5,
                      boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
                    }}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                    style={{
                      left: `${module.position.x}%`,
                      top: `${module.position.y}%`,
                    }}
                  >
                    <div
                      className={`
                        w-16 h-16 rounded-full bg-gradient-to-br ${getNodeColor(module, false)}
                        flex items-center justify-center text-white shadow-lg
                        border-4 border-white
                        ${module.isUnlocked ? 'hover:shadow-xl' : 'opacity-60'}
                      `}
                    >
                      {module.icon}
                    </div>
                    
                    {/* Module Title and Date */}
                    <div className="absolute top-20 left-1/2 transform -translate-x-1/2 text-center min-w-max">
                      <div className="bg-white rounded-lg px-3 py-2 shadow-md border">
                        <p className="text-sm font-semibold text-gray-800">
                          {module.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          до {module.dueDate}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-center">
                    <p className="font-semibold">{module.title}</p>
                    <p className="text-sm text-gray-600">Срок: {module.dueDate}</p>
                    <p className="text-xs text-gray-500">
                      {module.isUnlocked ? 'Доступен сейчас' : 'Скоро откроется'}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>

          {/* Progress Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <div className="bg-white rounded-xl p-6 shadow-lg max-w-md mx-auto">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Твой прогресс
              </h3>
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Модулей завершено:</span>
                <span className="font-bold text-blue-600">0 / 9</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "11%" }}
                  transition={{ delay: 1, duration: 1 }}
                  className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full"
                />
              </div>
              <p className="text-sm text-gray-600">
                Продолжай в том же духе! 🎯
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default LearningPlatform;