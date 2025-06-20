import { Card, CardContent } from "@/components/ui/card";
import type { ProjectType } from "@shared/schema";

interface ProjectTypeSelectorProps {
  projectTypes: ProjectType[];
}

export default function ProjectTypeSelector({ projectTypes }: ProjectTypeSelectorProps) {
  return (
    <section className="bg-muted py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl font-semibold text-foreground mb-6">
          Which of the following best matches your project?
        </h2>
        <div className="flex overflow-x-auto space-x-4 pb-4">
          {projectTypes.map((projectType) => (
            <Card 
              key={projectType.id}
              className="flex-shrink-0 min-w-[180px] card-hover cursor-pointer"
            >
              <CardContent className="p-4">
                <img 
                  src={projectType.imageUrl} 
                  alt={projectType.name}
                  className="w-full h-24 object-cover rounded mb-3"
                />
                <h3 className="font-medium text-foreground text-sm">
                  {projectType.name}
                </h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
