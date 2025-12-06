import ProgressCard from "../components/Tools/ProgressCard";
import { TrendingUp, Award, BookOpen, Heart } from "lucide-react";

export default function Home() {
  // Sample saved methods data
  const savedMethods = [
    {
      id: 1,
      title: "Quick Pickle Cucumbers",
      category: "Pickling",
      image_url: null,
    },
    {
      id: 2,
      title: "Sauerkraut Fermentation",
      category: "Fermenting",
      image_url: null,
    },
    {
      id: 3,
      title: "Tomato Canning",
      category: "Canning",
      image_url: null,
    },
  ];

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 gap-4">
      {/* Level Card */}
      <ProgressCard
        icon={TrendingUp}
        iconBgColor="bg-primary"
        heading="Level"
        subheading="Pickling Beginner"
        progressLabel="Next Level"
        progressCurrent={125}
        progressMax={250}
        showProgressBar={true}
      />

      {/* Learned Methods Card */}
      <ProgressCard
        icon={BookOpen}
        iconBgColor="bg-primary"
        heading="Mastered Methods"
        subheading="5 / 10"
        progressLabel="Progress"
        progressCurrent={5}
        progressMax={10}
        showProgressBar={true}
      />

      {/* Achievements Card */}
      <ProgressCard
        icon={Award}
        iconBgColor="bg-primary"
        heading="Achievements"
        subheading="2 / 3"
        progressLabel="Unlocked"
        progressCurrent={2}
        progressMax={3}
        showProgressBar={true}
      />

      {/* Saved Methods List */}
      <div className="card card-border p-3 w-full max-w-md space-y-3">
        <div className="flex items-center gap-2">
          <div
            className={`flex justify-center items-center bg-primary text-white rounded-box w-12 h-12`}
          >
            <Heart />
          </div>
          <h3 className="font-semibold text-lg">Saved Methods</h3>
        </div>
        <div className="space-y-2">
          {savedMethods.map((method) => (
            <div
              key={method.id}
              className="card bg-base-100  flex flex-row items-center gap-3 hover:bg-base-200 transition-colors cursor-pointer"
            >
              {method.image_url ? (
                <img
                  src={method.image_url}
                  alt={method.title}
                  className="w-12 h-12 rounded-box object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-base-200 rounded-box flex items-center justify-center">
                  <BookOpen size={20} />
                </div>
              )}
              <div className="flex-1">
                <p className="font-medium text-sm">{method.title}</p>
                <p className="text-xs text-base-content/60">
                  {method.category}
                </p>
              </div>
              <Heart className="text-error fill-error" size={18} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
