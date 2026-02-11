import { Scissors, Keyboard, Edit3, Lightbulb, Delete, Trash2 } from "lucide-react";

const Step = ({ number, title, description, icon }: any) => {
  return (
    <div className="flex gap-4 items-start">
      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-semibold">
        {number}
      </span>

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

const PrivateAreasGuide = () => {
  return (
    <div className="w-full bg-white rounded-2xl shadow-2xl border border-gray-200 p-6">
      {/* Header */}
      <div className="mb-5">
        <h2 className="text-gray-800 font-semibold">
          A Private area lets you interact with the people you want like in a physical space 
        </h2>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-gray-50 rounded-xl p-5">
        <Step
          number="1"
          title="Press 0 to Activate"
          description="Turn on and off snipping mode with the 0 (zero) key."
          icon={<Keyboard size={18} className="text-blue-600" />}
        />

        <Step
          number="2"
          title="Snip the Area"
          description="Click & drag to mark a private zone."
          icon={<Scissors size={18} className="text-blue-600" />}
        />

        <Step
          number="3"
          title="Name the Area"
          description="Give your private area a meaningful name."
          icon={<Edit3 size={18} className="text-blue-600" />}
        />
        <Step
          number="4"
          title="Delete an Area"
          description="Delete unwanted private areas from your space."
          icon={<Trash2 size={18} className="text-blue-600" />}
        />
      </div>
      {/* Tip */}
      <div className="flex items-center gap-2 mt-4 text-sm text-gray-600">
        <Lightbulb size={16} className="text-yellow-500" />
        <span>
          Tip: You can create multiple private areas in one space.
        </span>
      </div>
    </div>
  );
};

export default PrivateAreasGuide;
