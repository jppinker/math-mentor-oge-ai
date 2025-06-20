import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChevronRight, Image as ImageIcon, Calculator, BookOpen, Brain, PenTool } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import LatexRenderer from "@/components/chat/LatexRenderer";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

interface Problem {
  question_id: string;
  problem_text: string;
  answer: string;
  solution_text: string;
  solutiontextexpanded: string;
  problem_image?: string;
  code: string;
  difficulty?: string;
  calculator_allowed?: boolean;
}

interface MCQQuestion {
  question_id: string;
  problem_text: string;
  answer: string;
  skills: number;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
}

interface SubTopic {
  id: string;
  name: string;
  problems: Problem[];
  mcqCount: number;
}

interface MainTopic {
  id: string;
  name: string;
  subtopics: SubTopic[];
}

const PracticeExercise = () => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [mcqCounts, setMcqCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [expandedStates, setExpandedStates] = useState<{
    answer: boolean;
    solution: boolean;
    expanded: boolean;
  }>({
    answer: false,
    solution: false,
    expanded: false
  });

  // Main topic definitions with subtopics
  const mainTopics: MainTopic[] = [
    {
      id: "1",
      name: "Числа и вычисления",
      subtopics: [
        { id: "1.1", name: "Натуральные и целые числа", problems: [], mcqCount: 0 },
        { id: "1.2", name: "Дроби и проценты", problems: [], mcqCount: 0 },
        { id: "1.3", name: "Рациональные числа и арифметические действия", problems: [], mcqCount: 0 },
        { id: "1.4", name: "Действительные числа", problems: [], mcqCount: 0 },
        { id: "1.5", name: "Приближённые вычисления", problems: [], mcqCount: 0 },
        { id: "1.6", name: "Работа с данными и графиками", problems: [], mcqCount: 0 },
        { id: "1.7", name: "Прикладная геометрия: площади и расстояния в жизни", problems: [], mcqCount: 0 }
      ]
    },
    {
      id: "2",
      name: "Алгебраические выражения",
      subtopics: [
        { id: "2.1", name: "Буквенные выражения", problems: [], mcqCount: 0 },
        { id: "2.2", name: "Степени", problems: [], mcqCount: 0 },
        { id: "2.3", name: "Многочлены", problems: [], mcqCount: 0 },
        { id: "2.4", name: "Алгебраические дроби", problems: [], mcqCount: 0 },
        { id: "2.5", name: "Арифметические корни", problems: [], mcqCount: 0 }
      ]
    },
    {
      id: "3",
      name: "Уравнения и неравенства",
      subtopics: [
        { id: "3.1", name: "Уравнения и системы", problems: [], mcqCount: 0 },
        { id: "3.2", name: "Неравенства и системы", problems: [], mcqCount: 0 },
        { id: "3.3", name: "Текстовые задачи", problems: [], mcqCount: 0 }
      ]
    },
    {
      id: "4",
      name: "Числовые последовательности",
      subtopics: [
        { id: "4.1", name: "Последовательности", problems: [], mcqCount: 0 },
        { id: "4.2", name: "Арифметическая и геометрическая прогрессии", problems: [], mcqCount: 0 }
      ]
    },
    {
      id: "5",
      name: "Функции",
      subtopics: [
        { id: "5.1", name: "Свойства и графики функций", problems: [], mcqCount: 0 }
      ]
    },
    {
      id: "6",
      name: "Координаты на прямой и плоскости",
      subtopics: [
        { id: "6.1", name: "Координатная прямая", problems: [], mcqCount: 0 },
        { id: "6.2", name: "Декартовы координаты", problems: [], mcqCount: 0 }
      ]
    },
    {
      id: "7",
      name: "Геометрия",
      subtopics: [
        { id: "7.1", name: "Геометрические фигуры", problems: [], mcqCount: 0 },
        { id: "7.2", name: "Треугольники", problems: [], mcqCount: 0 },
        { id: "7.3", name: "Многоугольники", problems: [], mcqCount: 0 },
        { id: "7.4", name: "Окружность и круг", problems: [], mcqCount: 0 },
        { id: "7.5", name: "Измерения", problems: [], mcqCount: 0 },
        { id: "7.6", name: "Векторы", problems: [], mcqCount: 0 },
        { id: "7.7", name: "Дополнительные темы по геометрии", problems: [], mcqCount: 0 }
      ]
    },
    {
      id: "8",
      name: "Вероятность и статистика",
      subtopics: [
        { id: "8.1", name: "Описательная статистика", problems: [], mcqCount: 0 },
        { id: "8.2", name: "Вероятность", problems: [], mcqCount: 0 },
        { id: "8.3", name: "Комбинаторика", problems: [], mcqCount: 0 },
        { id: "8.4", name: "Множества", problems: [], mcqCount: 0 },
        { id: "8.5", name: "Графы", problems: [], mcqCount: 0 }
      ]
    }
  ];

  useEffect(() => {
    fetchProblems();
    fetchMCQCounts();
  }, []);

  const fetchProblems = async () => {
    try {
      const { data, error } = await supabase
        .from('copy')
        .select('question_id, problem_text, answer, solution_text, solutiontextexpanded, problem_image, code, difficulty, calculator_allowed')
        .order('code');

      if (error) {
        console.error('Error fetching problems:', error);
        return;
      }

      if (data) {
        setProblems(data);
        if (data.length > 0) {
          setSelectedProblem(data[0]);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMCQCounts = async () => {
    try {
      const { data, error } = await supabase
        .from('mcq_with_options')
        .select('skills')
        .not('skills', 'is', null);

      if (error) {
        console.error('Error fetching MCQ counts:', error);
        return;
      }

      if (data) {
        const counts: Record<string, number> = {};
        data.forEach(item => {
          const skillId = item.skills.toString();
          counts[skillId] = (counts[skillId] || 0) + 1;
        });
        setMcqCounts(counts);
      }
    } catch (error) {
      console.error('Error fetching MCQ counts:', error);
    }
  };

  // Group problems by topics and subtopics with MCQ counts
  const organizedTopics = mainTopics.map(topic => ({
    ...topic,
    subtopics: topic.subtopics.map(subtopic => ({
      ...subtopic,
      problems: problems.filter(problem => problem.code === subtopic.id),
      mcqCount: mcqCounts[subtopic.id] || 0
    }))
  }));

  const handleProblemSelect = (problem: Problem) => {
    setSelectedProblem(problem);
    setExpandedStates({
      answer: false,
      solution: false,
      expanded: false
    });
  };

  const handleMCQPractice = (subtopicId: string) => {
    navigate(`/mcq-practice?skill=${subtopicId}`);
  };

  const toggleSection = (section: 'answer' | 'solution' | 'expanded') => {
    setExpandedStates(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Загружаем задачи...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3 text-gray-900">Практические задачи ОГЭ</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Выберите тему и навык для практики. Задачи организованы по официальному кодификатору ОГЭ.
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <PenTool className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">FRQ - Развёрнутые ответы</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-700">MCQ - Тесты</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side - Topics and Problems Navigation */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg border-0">
              <div className="p-6 border-b bg-gradient-to-r from-primary to-primary/90 text-white rounded-t-lg">
                <h2 className="text-xl font-semibold">Темы и навыки</h2>
                <p className="text-sm text-primary-foreground/80 mt-1">
                  {problems.length} FRQ задач и {Object.values(mcqCounts).reduce((sum, count) => sum + count, 0)} MCQ доступно
                </p>
              </div>
              
              <ScrollArea className="h-[calc(100vh-350px)] p-4">
                <Accordion type="single" collapsible className="w-full space-y-2">
                  {organizedTopics.map((topic) => {
                    const totalProblems = topic.subtopics.reduce((sum, subtopic) => sum + subtopic.problems.length, 0);
                    const totalMCQ = topic.subtopics.reduce((sum, subtopic) => sum + subtopic.mcqCount, 0);
                    
                    return (
                      <AccordionItem key={topic.id} value={topic.id} className="border rounded-lg overflow-hidden">
                        <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 text-left">
                          <div className="flex items-center justify-between w-full mr-4">
                            <div className="flex items-center gap-3">
                              <span className="bg-primary text-white text-sm font-medium px-2 py-1 rounded">
                                {topic.id}
                              </span>
                              <span className="font-medium text-gray-800">{topic.name}</span>
                            </div>
                            <div className="flex gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {totalProblems} FRQ
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {totalMCQ} MCQ
                              </Badge>
                            </div>
                          </div>
                        </AccordionTrigger>
                        
                        <AccordionContent className="px-4 pb-4">
                          <div className="space-y-3 mt-2">
                            {topic.subtopics.map((subtopic) => (
                              <div key={subtopic.id} className="border-l-2 border-gray-200 pl-4">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="font-medium text-sm text-gray-700">
                                    {subtopic.id}. {subtopic.name}
                                  </h4>
                                  <div className="flex gap-2">
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                      {subtopic.problems.length} FRQ
                                    </span>
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                      {subtopic.mcqCount} MCQ
                                    </span>
                                  </div>
                                </div>

                                {/* Practice Options */}
                                <div className="space-y-2 mb-3">
                                  {subtopic.mcqCount > 0 && (
                                    <Button
                                      onClick={() => handleMCQPractice(subtopic.id)}
                                      variant="outline"
                                      size="sm"
                                      className="w-full justify-start text-xs h-8 bg-green-50 border-green-200 hover:bg-green-100"
                                    >
                                      <Brain className="h-3 w-3 mr-2 text-green-600" />
                                      <span className="text-green-700">Тестовая практика ({subtopic.mcqCount})</span>
                                    </Button>
                                  )}
                                </div>
                                
                                {subtopic.problems.length > 0 ? (
                                  <div className="space-y-1">
                                    <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                                      <PenTool className="h-3 w-3" />
                                      FRQ Задачи:
                                    </div>
                                    {subtopic.problems.map((problem) => (
                                      <button
                                        key={problem.question_id}
                                        onClick={() => handleProblemSelect(problem)}
                                        className={`w-full text-left p-3 rounded-lg transition-all text-sm border ${
                                          selectedProblem?.question_id === problem.question_id
                                            ? "bg-primary/10 border-primary/30 shadow-sm"
                                            : "bg-white hover:bg-gray-50 border-gray-200"
                                        }`}
                                      >
                                        <div className="flex items-start justify-between">
                                          <div className="flex-grow">
                                            <div className="flex items-center gap-2 mb-2">
                                              {problem.calculator_allowed && (
                                                <Calculator className="h-3 w-3 text-blue-500" />
                                              )}
                                              {problem.problem_image && (
                                                <ImageIcon className="h-3 w-3 text-green-500" />
                                              )}
                                              {problem.difficulty && (
                                                <span className="text-xs bg-yellow-100 text-yellow-800 px-1 py-0.5 rounded">
                                                  {problem.difficulty}
                                                </span>
                                              )}
                                            </div>
                                            <p className="text-gray-600 line-clamp-2 text-xs">
                                              {problem.problem_text?.substring(0, 80)}...
                                            </p>
                                          </div>
                                          <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-xs text-gray-500 italic py-2">FRQ задачи не найдены</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </ScrollArea>
            </Card>
          </div>

          {/* Right Side - Problem Detail */}
          <div className="lg:col-span-2">
            {selectedProblem ? (
              <Card className="shadow-lg border-0">
                <div className="bg-gradient-to-r from-secondary to-accent text-white p-6 rounded-t-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-lg bg-white/20 text-white px-3 py-1 rounded">
                      {selectedProblem.code}
                    </span>
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      <PenTool className="h-3 w-3 mr-1" />
                      FRQ
                    </Badge>
                    {selectedProblem.calculator_allowed && (
                      <span className="text-xs bg-white/20 text-white px-2 py-1 rounded">
                        Калькулятор разрешён
                      </span>
                    )}
                    {selectedProblem.difficulty && (
                      <span className="text-xs bg-white/20 text-white px-2 py-1 rounded">
                        {selectedProblem.difficulty}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold">Задача для решения</h3>
                </div>
                
                <CardContent className="p-6">
                  <ScrollArea className="h-[calc(100vh-420px)] min-h-[400px]">
                    <div className="space-y-6">
                      {/* Problem Image */}
                      {selectedProblem.problem_image && (
                        <div className="flex justify-center bg-gray-50 p-4 rounded-lg">
                          <img
                            src={selectedProblem.problem_image}
                            alt="Изображение задачи"
                            className="max-w-full h-auto rounded-lg shadow-sm"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}

                      {/* Problem Text */}
                      <div className="prose max-w-none">
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-800">
                          <BookOpen className="h-5 w-5 text-primary" />
                          Условие задачи
                        </h3>
                        <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-primary">
                          <LatexRenderer content={selectedProblem.problem_text || ""} />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-4">
                        <Button
                          onClick={() => toggleSection('answer')}
                          variant="outline"
                          className="w-full justify-start h-12 text-left bg-green-50 border-green-200 hover:bg-green-100"
                        >
                          <span className="text-green-700">📋 Показать ответ</span>
                        </Button>
                        
                        <Collapsible open={expandedStates.answer} onOpenChange={() => toggleSection('answer')}>
                          <CollapsibleContent>
                            <div className="bg-green-50 border border-green-200 p-6 rounded-lg mt-2">
                              <h4 className="font-semibold text-green-800 mb-3 text-lg">✅ Ответ:</h4>
                              <div className="text-green-900 text-lg">
                                <LatexRenderer content={selectedProblem.answer || "Ответ не указан"} />
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>

                        <Button
                          onClick={() => toggleSection('solution')}
                          variant="outline"
                          className="w-full justify-start h-12 text-left bg-blue-50 border-blue-200 hover:bg-blue-100"
                        >
                          <span className="text-blue-700">💡 Показать решение</span>
                        </Button>
                        
                        <Collapsible open={expandedStates.solution} onOpenChange={() => toggleSection('solution')}>
                          <CollapsibleContent>
                            <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg mt-2">
                              <h4 className="font-semibold text-blue-800 mb-3 text-lg">🔍 Решение:</h4>
                              <div className="text-blue-900">
                                <LatexRenderer content={selectedProblem.solution_text || "Решение не указано"} />
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>

                        {selectedProblem.solutiontextexpanded && (
                          <>
                            <Button
                              onClick={() => toggleSection('expanded')}
                              variant="outline"
                              className="w-full justify-start h-12 text-left bg-purple-50 border-purple-200 hover:bg-purple-100"
                            >
                              <span className="text-purple-700">🔎 Я всё ещё не понял(а). Покажи подробнее.</span>
                            </Button>
                            
                            <Collapsible open={expandedStates.expanded} onOpenChange={() => toggleSection('expanded')}>
                              <CollapsibleContent>
                                <div className="bg-purple-50 border border-purple-200 p-6 rounded-lg mt-2">
                                  <h4 className="font-semibold text-purple-800 mb-3 text-lg">📚 Подробное объяснение:</h4>
                                  <div className="text-purple-900">
                                    <LatexRenderer content={selectedProblem.solutiontextexpanded} />
                                  </div>
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          </>
                        )}
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-lg border-0">
                <CardContent className="p-12 text-center">
                  <div className="max-w-md mx-auto">
                    <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-6" />
                    <h3 className="text-2xl font-semibold text-gray-600 mb-3">
                      Выберите задачу для решения
                    </h3>
                    <p className="text-gray-500 text-lg leading-relaxed mb-6">
                      Выберите тему и задачу из списка слева, чтобы начать практику решения задач ОГЭ
                    </p>
                    <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <PenTool className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <div className="text-sm font-medium text-blue-800">FRQ</div>
                        <div className="text-xs text-blue-600">Развёрнутые ответы</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <Brain className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <div className="text-sm font-medium text-green-800">MCQ</div>
                        <div className="text-xs text-green-600">Тестовые вопросы</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PracticeExercise;
