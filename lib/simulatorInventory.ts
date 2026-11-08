export const interactiveSimulatorInventory = [
  {
    lesson: "Measurements & Vectors",
    file: "app/lessons/measurements-vectors/page.tsx",
    simulators: [
      {
        name: "Interactive vector simulator",
        interaction:
          "Adjust vector magnitudes and angles or drag arrowheads; observe resultant components, magnitude, and direction.",
      },
    ],
  },
  {
    lesson: "Fluids",
    file: "app/lessons/fluids/page.tsx",
    simulators: [
      {
        name: "Archimedes’ Principle Lab",
        interaction:
          "Change object and fluid densities to observe floating, sinking, buoyancy, and submerged fraction.",
      },
      {
        name: "Continuity Principle",
        interaction:
          "Adjust pipe areas and inlet speed to see flow, outlet speed, and flow rate update.",
      },
      {
        name: "Application: airflow around an airplane wing",
        interaction:
          "Change upper-surface airflow speed to update the pressure comparison and airflow diagram.",
      },
      {
        name: "Bernoulli’s Principle — narrowing-pipe flow",
        interaction:
          "Change wide-section flow speed to update narrow-section speed, pressure, and animated flow visualization.",
      },
    ],
  },
  {
    lesson: "Temperature & Heat",
    file: "app/lessons/temperature-heat/page.tsx",
    simulators: [
      {
        name: "Temperature Scale Converter",
        interaction:
          "Change temperature values to see converted values and the illustrative thermometer update.",
      },
      {
        name: "Graduated Thermometer",
        interaction:
          "Set temperature and scale to observe the reading and liquid level; set a target for practice.",
      },
      {
        name: "Linear Thermal Expansion Calculator",
        interaction:
          "Choose a material and change length and temperatures to calculate expansion or contraction.",
      },
      {
        name: "Specific Heat Calculator",
        interaction:
          "Change mass, substance, and temperatures to calculate heat transfer and its direction.",
      },
    ],
  },
  {
    lesson: "Waves & Sound",
    file: "app/lessons/waves-sound/page.tsx",
    simulators: [
      {
        name: "Wave simulator",
        interaction:
          "Adjust amplitude, frequency, wavelength, and fixed-medium speed to observe the animated wave and related quantities.",
      },
      {
        name: "Interactive calculator · wave on a string",
        interaction:
          "Change string tension, mass, and length to calculate linear density, wave speed, and fundamental frequency.",
      },
      {
        name: "Sound Speed in Different Media",
        interaction:
          "Choose a sound-speed model and adjust its physical inputs to calculate sound speed.",
      },
      {
        name: "Interactive Doppler calculator",
        interaction:
          "Change source and observer speeds, directions, source frequency, and sound speed to calculate observed frequency.",
      },
      {
        name: "Listen to frequency and pitch",
        interaction:
          "Adjust tone frequency and play or stop the generated sine tone to hear the pitch change.",
      },
    ],
  },
  {
    lesson: "Optics",
    file: "app/lessons/optics/page.tsx",
    simulators: [
      {
        name: "Interactive Snell’s law simulation",
        interaction:
          "Choose or enter refractive indices and an incidence angle to see the ray diagram and refraction result update.",
      },
      {
        name: "Convex and Concave Lenses",
        interaction:
          "Choose a lens type and change object distance and height to observe image properties and the ray diagram.",
      },
      {
        name: "Mirror Image Simulator",
        interaction:
          "Select a mirror and adjust object and mirror measurements to explore image properties and ray diagrams.",
      },
    ],
  },
  {
    lesson: "Electricity",
    file: "app/lessons/electricity/page.tsx",
    simulators: [
      {
        name: "Interactive: transfer electrons",
        interaction:
          "Transfer electrons between objects to observe their charges and conservation of total charge.",
      },
      {
        name: "Series vs. parallel circuits",
        interaction:
          "Change source voltage and resistor values to compare equivalent resistance, branch currents, and total current.",
      },
      {
        name: "Drag-and-drop circuit builder",
        interaction:
          "Add, remove, and arrange batteries, resistors, and bulbs and adjust their values to observe current and bulb brightness.",
      },
      {
        name: "Interactive Coulomb’s law calculator",
        interaction:
          "Change two charges and their separation to calculate force magnitude and attraction or repulsion.",
      },
      {
        name: "Force on a test charge in an electric field",
        interaction:
          "Change electric-field strength and test charge to calculate force and its direction.",
      },
      {
        name: "Ohm’s law calculator",
        interaction:
          "Change voltage and resistance to calculate current and electrical power.",
      },
    ],
  },
] as const;

export const interactiveSimulatorCount = interactiveSimulatorInventory.reduce(
  (total, lesson) => total + lesson.simulators.length,
  0
);
