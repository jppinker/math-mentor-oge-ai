
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const resources = [
  {
    title: "Электронный учебник",
    description: "Полные теоретические объяснения и практические задачи с решениями.",
    icon: "📚",
    buttonText: "Открыть учебник",
    link: "/textbook"
  },
  {
    title: "Видеоуроки",
    description: "Наглядные объяснения ключевых концепций от опытных учителей математики.",
    icon: "🎬",
    buttonText: "Смотреть видео",
    link: "/textbook"
  },
  {
    title: "Практические упражнения",
    description: "База заданий прошлых лет ОГЭ с обратной связью на базе ИИ.",
    icon: "✏️",
    buttonText: "Начать практику",
    link: "/practice"
  }
];

const ResourcesSection = () => {
  return (
    <section id="resources" className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="section-title">Учебные ресурсы</h2>
          <p className="section-description">
            Все материалы, необходимые для освоения математики ОГЭ.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {resources.map((resource, index) => (
            <div key={index} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center">
              <div className="text-5xl mb-6 bg-gray-50 rounded-full w-20 h-20 flex items-center justify-center">{resource.icon}</div>
              <h3 className="text-xl font-bold mb-3 text-primary font-heading">{resource.title}</h3>
              <p className="text-gray-600 mb-8">{resource.description}</p>
              <Button className="bg-primary hover:bg-primary/90 rounded-full mt-auto" asChild>
                <Link to={resource.link}>
                  {resource.buttonText}
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ResourcesSection;
