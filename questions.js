// This file contains the fixed 30-question bank, with each question being accompanied by a link to the information it asks about.
// 'image' is null for now; a non-revealing image path may be added later for Group A only (it MUST never reveal the answer).
// Sources were added per-question for traceability (they are NOT shown to participants).

const QUESTIONS = [
  // Source: https://www.britannica.com/science/What-Animal-Has-the-Longest-Life-Span
  { id: 1,  text: "Which animal has the longest known lifespan of any vertebrate?",
    options: ["Galápagos tortoise", "Greenland shark", "Bowhead whale", "Koi carp"],
    correct: "Greenland shark", image: null },

  // Source: https://www.britannica.com/list/5-surprising-facts-about-bats
  { id: 2,  text: "What is the only mammal capable of flight?",
    options: ["Flying squirrel", "Colugo", "Bat", "Sugar glider"],
    correct: "Bat", image: null },

  // Source: https://www.britannica.com/science/How-Many-Hearts-Does-an-Octopus-Have
  { id: 3,  text: "How many hearts does an octopus have?",
    options: ["One", "Two", "Three", "Five"],
    correct: "Three", image: null },

  // Source: https://www.britannica.com/science/Why-Are-Polar-Bears-White
  { id: 4,  text: "What colour is a polar bear's skin beneath its fur?",
    options: ["Pink", "White", "Black", "Grey"],
    correct: "Black", image: null },

  // Source: https://www.britannica.com/animal/hummingbird
  { id: 5,  text: "Which bird can fly backwards?",
    options: ["Kingfisher", "Hummingbird", "Swift", "Swallow"],
    correct: "Hummingbird", image: null },

  // Source: https://www.britannica.com/science/Animal-Group-Names
  { id: 6,  text: "A group of flamingos is called a what?",
    options: ["Flamboyance", "Flock", "Colony", "Parade"],
    correct: "Flamboyance", image: null },

  // Source: https://www.ifaw.org/international/journal/9-jaw-dropping-animals-strongest-bite
  { id: 7,  text: "Which animal has the strongest bite of any animal alive today?",
    options: ["Saltwater crocodile", "Great white shark", "Hippopotamus", "Hyena"],
    correct: "Saltwater crocodile", image: null },

  // Source: https://www.jagranjosh.com/general-knowledge/list-of-tallest-grass-species-in-the-world-1820003380-1
  { id: 8,  text: "What is the tallest type of grass in the world?",
    options: ["Sugarcane", "Bamboo", "Pampas grass", "Elephant grass"],
    correct: "Bamboo", image: null },

  // Source: https://www.britannica.com/place/Titan-astronomy
  { id: 9,  text: "Titan, the only moon known to have clouds and a dense atmosphere, orbits which planet?",
    options: ["Jupiter", "Neptune", "Saturn", "Uranus"],
    correct: "Saturn", image: null },

  // Source: https://naplab.com/guides/how-long-do-snails-sleep/
  { id: 10, text: "Roughly how long can a snail hibernate or estivate at a stretch?",
    options: ["A few hours", "One day", "Several days", "Up to three years"],
    correct: "Up to three years", image: null },

  // Source: https://www.britannica.com/animal/elephant-mammal
  { id: 11, text: "Which large land animal cannot jump?",
    options: ["Rhinoceros", "Hippopotamus", "Elephant", "Giraffe"],
    correct: "Elephant", image: null },

  // Source: https://pmc.ncbi.nlm.nih.gov/articles/PMC3056458/
  { id: 12, text: "What is the fastest muscle in the human body?",
    options: ["The heart", "The eye (blink) muscles", "The calf", "The jaw"],
    correct: "The eye (blink) muscles", image: null },

  // Source: https://www.pbs.org/wgbh/nova/article/koala-fingerprints/
  { id: 13, text: "Which animal's fingerprints are so similar to a human's they can be confused at a crime scene?",
    options: ["Chimpanzee", "Gorilla", "Koala", "Orangutan"],
    correct: "Koala", image: null },

  // Source: https://oceanservice.noaa.gov/facts/gbrlargeststructure.html
  { id: 14, text: "What is the largest living structure on Earth, visible from space?",
    options: ["The Amazon rainforest", "The Great Barrier Reef", "The Sahara", "Mount Everest"],
    correct: "The Great Barrier Reef", image: null },

  // Source: https://americanshrimp.com/shrimp-school-why-shrimp-hearts-are-in-their-heads/
  { id: 15, text: "A shrimp's heart is located in its what?",
    options: ["Tail", "Abdomen", "Head", "Legs"],
    correct: "Head", image: null },

  // Source: https://www.britannica.com/science/nitrogen
  { id: 16, text: "Which colourless, odourless gas makes up most of Earth's atmosphere?",
    options: ["Oxygen", "Carbon dioxide", "Nitrogen", "Argon"],
    correct: "Nitrogen", image: null },

  // Source: https://www.sciencedirect.com/topics/veterinary-science-and-veterinary-medicine/autotomy
  { id: 17, text: "What is the term for some lizards' ability to detach their tails when threatened?",
    options: ["Autotomy", "Mitosis", "Molting", "Regeneration"],
    correct: "Autotomy", image: null },

  // Source: https://www.britannica.com/animal/lion
  { id: 18, text: "Which big cat typically spends 21 to 22 hours a day resting?",
    options: ["Lion", "Cheetah", "Tiger", "Leopard"],
    correct: "Lion", image: null },

  // Source: https://www.britannica.com/topic/honey
  { id: 19, text: "Honey never spoils mainly because of its very low what?",
    options: ["Temperature", "Sugar content", "Moisture content", "Acidity alone"],
    correct: "Moisture content", image: null },

  // Source: https://kids.britannica.com/students/article/jellyfish/275144
  { id: 20, text: "Which sea creature has no brain and no heart?",
    options: ["Jellyfish", "Starfish", "Sea cucumber", "Octopus"],
    correct: "Jellyfish", image: null },

  // Source: https://www.britannica.com/place/Antarctica
  { id: 21, text: "Which continent has no native reptiles or snakes?",
    options: ["Australia", "Antarctica", "Europe", "South America"],
    correct: "Antarctica", image: null },

  // Source: https://www.britannica.com/science/How-Hot-Can-Lightning-Get
  { id: 22, text: "A bolt of lightning is roughly how many times hotter than the surface of the sun?",
    options: ["About the same", "Twice", "Around five times", "Around fifty times"],
    correct: "Around five times", image: null },

  // Source: https://www.britannica.com/animal/peregrine-falcon
  { id: 23, text: "Which bird is the fastest animal on Earth?",
    options: ["Golden eagle", "Peregrine falcon", "Frigatebird", "Gyrfalcon"],
    correct: "Peregrine falcon", image: null },

  // Source: https://kids.britannica.com/students/article/echidna/487704
  { id: 24, text: "What is a baby echidna called?",
    options: ["Joey", "Puggle", "Kit", "Calf"],
    correct: "Puggle", image: null },

  // Source: https://www.livescience.com/57477-why-are-bananas-considered-berries.html
  { id: 25, text: "Botanically speaking, which of these is a berry?",
    options: ["Banana", "Strawberry", "Raspberry", "Cherry"],
    correct: "Banana", image: null },

  // Source: https://a-z-animals.com/articles/the-pasture-bffs-why-cows-get-stressed-when-separated-from-their-besties/
  { id: 26, text: "Cows form best-friend bonds and get stressed when separated, showing they are highly what?",
    options: ["Territorial", "Social", "Nocturnal", "Migratory"],
    correct: "Social", image: null },

  // Source: https://www.britannica.com/science/mercury-chemical-element
  { id: 27, text: "Which metal is liquid at room temperature?",
    options: ["Lead", "Mercury", "Aluminium", "Tin"],
    correct: "Mercury", image: null },

  // Source: https://www.britannica.com/one-good-fact/whats-unique-about-wombat-poop
  { id: 28, text: "Wombats are known for producing droppings of what unusual shape?",
    options: ["Spherical", "Cube-shaped", "Star-shaped", "Flat discs"],
    correct: "Cube-shaped", image: null },

  // Source: https://www.britannica.com/science/What-Is-the-Loudest-Animal-on-Earth
  { id: 29, text: "What is the loudest animal on Earth?",
    options: ["Blue whale", "Sperm whale", "Howler monkey", "Lion"],
    correct: "Sperm whale", image: null },

  // Source: https://medium.com/did-you-know-short-fun-facts/science-animals-facts-c5077b2aa6ac
  { id: 30, text: "Which part of an ostrich is bigger than its brain?",
    options: ["Its heart", "Its eye", "Its stomach", "Its foot"],
    correct: "Its eye", image: null },
];


