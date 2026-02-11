import { MousePointerClick, Move, Trash2, Lightbulb, Cross, CrossIcon, CircleDot } from "lucide-react";

const Step = ({ number, title, description, icon }:any) => {
  return (
    <div className="flex gap-4 items-start">
      <div className="flex items-center gap-2">
        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-semibold">
          {number}
        </span>
      </div>

      <div>
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
        <p className="text-gray-600 text-sm mt-1 max-w-xs">
          {description}
        </p>
      </div>
    </div>
  );
};

const AddElementsGuide = () => {
  return (
    <div className="w-full bg-white rounded-2xl shadow-2xl border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 p-2 rounded-lg">
          <MousePointerClick className="text-blue-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Add Elements
          </h2>
          <p className="text-sm text-gray-500">
            Build the foundation of your space
          </p>
        </div>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-gray-50 rounded-xl p-5">
        <Step
          number="1"
          title="Pick & Place"
          description="Select elements from the panel and place them into your space."
          icon={<MousePointerClick size={18} className="text-blue-600" />}
        />

        <Step
          number="2"
          title="Drag to Adjust"
          description="Move elements freely by dragging them around."
          icon={<Move size={18} className="text-blue-600" />}
        />

        <Step
          number="3"
          title="Right-Click to Remove"
          description="Delete any element instantly with a right-click."
          icon={<Trash2 size={18} className="text-red-600" />}
        />
        <Step
          number="4"
          title="Don't add element on the red area"
          description="It is the spawning area of the user"
          icon={<CircleDot size={18} className="text-red-600 mb-5" />}
        />
      </div>

      {/* Footer note */}
      <div className="flex items-center gap-2 mt-4 text-sm text-gray-600">
        <Lightbulb size={16} className="text-yellow-500" />
        <span>
          Everything is editable — feel free to experiment.
        </span>
      </div>
    </div>
  );
};

export default AddElementsGuide;