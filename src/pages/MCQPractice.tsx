import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ChevronLeft, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import MathRenderer from "@/components/MathRenderer";
import { supabase } from "@/integrations/supabase/client";
import mathSkillsData from "../../documentation/math_skills_full.json";

interface MCQQuestion {
  question_id: string;
  problem_text: string;
  answer: string;
  skills: number;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  problem_image: string | null;
  solution_text: string | null;
}

interface MathSkill {
  skill: string;
  id: number;
}

const MCQPractice = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const skillId = parseInt(searchParams.get('skill') || '1');
  
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showSolution, setShowSolution] = useState(false);

  const skills = mathSkillsData as MathSkill[];
  const currentSkill = skills.find(s => s.id === skillId);

  // Russian option labels
  const optionLabels = ['А', 'Б', 'В', 'Г'];

  useEffect(() => {
    fetchQuestions();
  }, [skillId]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('mcq_with_options')
        .select('question_id, problem_text, answer, skills, option1, option2, option3, option4, problem_image, solution_text')
        .eq('skills', skillId)
        .limit(10);

      if (error) {
        console.error('Error fetching questions:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить вопросы",
          variant: "destructive",
        });
      } else {
        setQuestions(data || []);
      }
    } catch (error) {
      console.error('Error in fetchQuestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerClick = (optionIndex: number) => {
    if (isAnswered) return;
    
    const clickedOption = optionLabels[optionIndex];
    setSelectedAnswer(clickedOption);
    setIsAnswered(true);
    
    const currentQuestion = questions[currentQuestionIndex];
    const correctAnswer = currentQuestion.answer.trim();
    
    // Compare the clicked option (А, Б, В, Г) with the correct answer from database
    const isCorrect = clickedOption === correctAnswer;

    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      toast({
        title: "🎉 ПОЗДРАВЛЯЕМ!",
        description: "Правильный ответ!",
        className: "bg-green-50 border-green-200",
      });
    } else {
      toast({
        title: "❌ Неправильно!",
        description: `Правильный ответ: ${correctAnswer}`,
        variant: "destructive",
      });
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setShowSolution(false);
    } else {
      // Quiz completed
      toast({
        title: "Квиз завершен!",
        description: `Вы правильно ответили на ${correctAnswers} из ${questions.length} вопросов`,
      });
      navigate('/textbook');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20 pb-8">
          <div className="container mx-auto px-4">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Загрузка вопросов...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20 pb-8">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Button
                onClick={() => navigate('/textbook')}
                variant="outline"
                className="mb-6"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Назад к учебнику
              </Button>
              <Card>
                <CardContent className="text-center py-12">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Упражнения не найдены
                  </h3>
                  <p className="text-gray-600">
                    Для навыка "{currentSkill?.skill}" пока нет доступных упражнений
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const answerOptions = [
    currentQuestion.option1,
    currentQuestion.option2,
    currentQuestion.option3,
    currentQuestion.option4
  ].filter(option => option && option.trim().length > 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-16 pb-4">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Compact Header */}
          <div className="flex items-center justify-between mb-4">
            <Button
              onClick={() => navigate('/textbook')}
              variant="ghost"
              size="sm"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Назад
            </Button>
            <div className="flex items-center gap-4">
              <Badge variant="secondary">
                {currentQuestionIndex + 1}/{questions.length}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Правильных: {correctAnswers}
              </span>
            </div>
          </div>

          {/* Skill Info - Compact */}
          <div className="mb-3 p-3 bg-muted/30 rounded-lg">
            <span className="text-sm font-medium">Навык {skillId}: {currentSkill?.skill}</span>
          </div>

          {/* Question Card - Compact */}
          <Card className="mb-4">
            <CardContent className="p-4">
              {/* Problem Image */}
              {currentQuestion.problem_image && (
                <div className="mb-4 flex justify-center">
                  <img 
                    src={currentQuestion.problem_image} 
                    alt="Изображение к задаче" 
                    className="max-w-sm w-full h-auto object-contain rounded border"
                  />
                </div>
              )}
              
              {/* Problem Text */}
              <div className="mb-4">
                <MathRenderer text={currentQuestion.problem_text} />
              </div>

              {/* Answer Options - Grid Layout */}
              {answerOptions.length > 0 ? (
                <div className="grid gap-2 mb-4">
                  {answerOptions.map((option, index) => {
                    const optionLetter = optionLabels[index];
                    const isSelected = selectedAnswer === optionLetter;
                    const isCorrect = currentQuestion.answer.trim() === optionLetter;
                    
                    let buttonStyle = "w-full text-left p-3 h-auto justify-start text-sm ";
                    
                    if (isAnswered) {
                      if (isSelected && isCorrect) {
                        buttonStyle += "bg-green-100 border-green-500 text-green-800";
                      } else if (isSelected && !isCorrect) {
                        buttonStyle += "bg-red-100 border-red-500 text-red-800";
                      } else if (!isSelected && isCorrect) {
                        buttonStyle += "bg-green-50 border-green-300 text-green-700";
                      } else {
                        buttonStyle += "bg-muted/50 border-border text-muted-foreground";
                      }
                      buttonStyle += " cursor-not-allowed opacity-75";
                    } else {
                      buttonStyle += "bg-background border-border hover:bg-muted/50 cursor-pointer";
                    }

                    return (
                      <Button
                        key={index}
                        onClick={() => handleAnswerClick(index)}
                        disabled={isAnswered}
                        variant="outline"
                        className={buttonStyle}
                      >
                        <span className="font-bold text-primary mr-2">
                          {optionLetter}.
                        </span>
                        <div className="flex-1">
                          <MathRenderer text={option} className="inline-block" />
                        </div>
                        {isAnswered && isCorrect && (
                          <CheckCircle className="w-4 h-4 text-green-600 ml-2" />
                        )}
                        {isAnswered && isSelected && !isCorrect && (
                          <XCircle className="w-4 h-4 text-red-600 ml-2" />
                        )}
                      </Button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  Варианты ответов не найдены
                </div>
              )}

              {/* Action Buttons */}
              {isAnswered && (
                <div className="flex justify-center gap-2">
                  {currentQuestion.solution_text && (
                    <Button
                      onClick={() => setShowSolution(!showSolution)}
                      variant="outline"
                      size="sm"
                    >
                      {showSolution ? 'Скрыть решение' : 'Показать решение'}
                    </Button>
                  )}
                  <Button onClick={handleNextQuestion} size="sm">
                    {currentQuestionIndex < questions.length - 1 ? 'Далее' : 'Завершить'}
                  </Button>
                </div>
              )}

              {/* Solution */}
              {showSolution && currentQuestion.solution_text && (
                <div className="mt-4 p-3 bg-muted/30 rounded-lg border-l-4 border-primary">
                  <h4 className="font-medium mb-2 text-sm">Решение:</h4>
                  <div className="text-sm">
                    <MathRenderer text={currentQuestion.solution_text} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{
                width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MCQPractice;
