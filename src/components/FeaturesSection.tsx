
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const features = [
  {
    icon: "📊",
    title: "Персонализированные учебные планы",
    description: "Получите учебный план, адаптированный к вашим сильным и слабым сторонам на основе результатов входного теста."
  },
  {
    icon: "📝",
    title: "Практика с прошлогодними заданиями",
    description: "Доступ к базе заданий прошлых лет ОГЭ с пошаговыми решениями."
  },
  {
    icon: "🎓",
    title: "Видеоуроки",
    description: "Смотрите понятные объяснения ключевых математических концепций от опытных преподавателей."
  },
  {
    icon: "🤖",
    title: "ИИ-репетитор",
    description: "Получайте мгновенную помощь с задачами и персонализированное руководство в любое время."
  },
  {
    icon: "📈",
    title: "Отслеживание прогресса",
    description: "Следите за своим улучшением с течением времени с помощью подробной статистики и аналитики."
  },
  {
    icon: "🏆",
    title: "Цели и достижения",
    description: "Ставьте цели и зарабатывайте достижения по мере продвижения к успеху на экзамене."
  }
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="section-title">Функции платформы</h2>
          <p className="section-description">
            Всё необходимое для успешной сдачи ОГЭ по математике находится здесь.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border border-gray-100 shadow-sm hover:shadow-md transition-all rounded-xl overflow-hidden">
              <CardHeader className="pb-2">
                <div className="text-3xl mb-4 bg-blue-50 rounded-full w-14 h-14 flex items-center justify-center">{feature.icon}</div>
                <h3 className="text-xl font-bold text-primary font-heading">{feature.title}</h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
