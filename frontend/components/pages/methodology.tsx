'use client';

import { Target, Brain, Users, FileText, Star, Laptop, RefreshCcw, Activity, Globe, Rocket } from 'lucide-react';

export default function MethodologyPage() {
  const steps = [
    {
      icon: Target,
      title: "1. Defining scope",
      description: "Content development begins with defining the scope of the desired changes. Our medical team analyzes statistical information to discover which areas of our system should be further expanded. This may include adding new pathologies or expanding on existing conditions based on requirements provided by our partners."
    },
    {
      icon: Brain,
      title: "2. Expert knowledge elicitation",
      description: "Our medical editors collect high-quality literature regarding the introduced topic. We enter evidence-based information in the form of probabilistic characteristics of a given condition's prevalence, risk factors, and symptoms. Each piece of information contains a reference to the original source."
    },
    {
      icon: Users,
      title: "3. Peer review",
      description: "Every change undergoes a strict peer-review by another medical content editor. The newly provided data and sources are validated, and improvements are discussed and introduced by a panel of collaborating doctors."
    },
    {
      icon: FileText,
      title: "4. Assembling clinical cases",
      description: "Our doctors are responsible for finding literature-based clinical cases that validate the system's performance. We continuously test our medical knowledge base against complex cases reported in journals like The New England Journal of Medicine to ensure an exceptional standard of accuracy (currently targeting >96% condition accuracy)."
    },
    {
      icon: Star,
      title: "5. Expert review",
      description: "The newly created content is verified by a board-certified doctor selected from our expert panel with relevant experience in the given area. Only after accepting this review does the technical testing phase begin."
    },
    {
      icon: Laptop,
      title: "6. Technical review",
      description: "A data scientist checks whether the content has been developed according to internal AI guidelines. They check for symptom duplication, verify hierarchical logic, and ensure the probabilistic model parameters are structurally sound."
    },
    {
      icon: RefreshCcw,
      title: "7. Regression testing",
      description: "The new AI model is built and evaluated across thousands of historical clinical cases. This continuous regression testing ensures that introducing new information does not negatively impact our established inference baselines."
    },
    {
      icon: Activity,
      title: "8. Manual testing",
      description: "Once regression testing is passed, our doctors manually test the newly introduced conditions and symptoms. This subjective evaluation mimics real-world scenarios to guarantee an intuitive safety net for patients and providers."
    },
    {
      icon: Globe,
      title: "9. Updating translations",
      description: "Content is continually internationalized to support a diverse demographic of patients. Translations are provided and verified exclusively by native speakers with a formal medical education."
    },
    {
      icon: Rocket,
      title: "10. Deploy",
      description: "Lastly, the fully tested models are deployed to the cloud-based OmniMed API. With every release, we track modifications carefully so our partners know exactly how the knowledge base is expanding."
    }
  ];

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-16 text-center">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-4">
            Clinical <span className="text-blue-600">Methodology</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            The OmniMed medical knowledge base is rigorously maintained through a multi-stage clinical content development process. This ensures maximum accuracy, safety, and reliability.
          </p>
        </div>

        <div className="space-y-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div 
                key={index} 
                className="relative bg-gray-50 rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row gap-6 items-start group"
              >
                <div className="flex-shrink-0 bg-blue-100 p-4 rounded-xl group-hover:bg-blue-600 transition-colors duration-300">
                  <Icon className="h-8 w-8 text-blue-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-16 text-center border-t border-gray-100 pt-12">
          <p className="text-sm text-gray-400">
            For more detailed technical documentation or integration questions, please contact our implementation team.
          </p>
        </div>
      </div>
    </div>
  );
}
