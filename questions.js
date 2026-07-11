// This file contains a fixed 30-question bank, with each question being verifiable using the link above it.

// Sources were added per-question for traceability (they are NOT shown to participants).
// Some questions are deliberately text only, as an image would either reveal the answer or has nothing meaningful to illustrate.

// Fields:
//    "options" : Is used to show the available options per question.
//    "correct" : Is used to store the correct option.
//    "image"   : Is used to store question-related images, they are ONLY shown to Group A:
//        null        ---> Means text-only.
//        "path.jpg"  ---> Means one image under the question.
//        [4 paths]   ---> Means one image per option, they are stored in the same order as the "options" field.
//    "explanation" : Contains a short fact that is shown to both groups during the Learning Phase.

const QUESTIONS = [
  // Source: https://www.britannica.com/science/What-Animal-Has-the-Longest-Life-Span
  { id: 1,  text: "Which animal has the longest known lifespan of any vertebrate?",
    options: ["Galápagos tortoise", "Greenland shark", "Bowhead whale", "Koi carp"],
    correct: "Greenland shark",
    image: null,
    explanation: "The Greenland shark is the longest-living vertebrate, with some possibly being more than 500 years old."},

  // Source: https://www.britannica.com/list/5-surprising-facts-about-bats
  { id: 2,  text: "What is the only mammal capable of flight?",
    options: ["Flying squirrel", "Colugo", "Bat", "Sugar glider"],
    correct: "Bat",
    image: null,
    explanation: "Bats are the only mammals capable of flight; the others listed only glide."},

  // Source: https://www.britannica.com/science/How-Many-Hearts-Does-an-Octopus-Have
  { id: 3,  text: "How many hearts does an octopus have?",
    options: ["One", "Two", "Three", "Five"],
    correct: "Three",
    image: "images/Q3/1-Octopus.jpg",
    explanation: "An octopus has three hearts: two pump blood through the gills and one pumps it around the body."},    

  // Source: https://www.britannica.com/science/Why-Are-Polar-Bears-White
  { id: 4,  text: "What color is a polar bear's skin beneath its fur?",
    options: ["Pink", "White", "Black", "Grey"],
    correct: "Black",
    image: "images/Q4/1-Polar_bear.jpg",
    explanation: "A polar bear's skin is black, which helps it absorb heat from the sun; its fur is colorless but appears white because of the way it interacts with light."},

  // Source: https://www.britannica.com/animal/hummingbird
  { id: 5,  text: "Which bird can fly backwards?",
    options: ["Kingfisher", "Hummingbird", "Swift", "Swallow"],
    correct: "Hummingbird",
    image: null,
    explanation: "The hummingbird is the only bird that can fly backwards."},

  // Source: https://www.britannica.com/science/Animal-Group-Names
  { id: 6,  text: "A group of flamingos is called a what?",
    options: ["Flamboyance", "Flock", "Colony", "Parade"],
    correct: "Flamboyance",
    image: "images/Q6/1-Flamingos.jpg",
    explanation: "A group of flamingos is called a 'flamboyance', a fitting name for such brightly colored birds."},

  // Source: https://www.ifaw.org/international/journal/9-jaw-dropping-animals-strongest-bite
  { id: 7,  text: "Which animal has the strongest bite of any animal alive today?",
    options: ["Saltwater crocodile", "Great white shark", "Hippopotamus", "Hyena"],
    correct: "Saltwater crocodile",
    image: ["images/Q7/1-Saltwater_crocodile.jpg", "images/Q7/2-Great_white_shark.jpg", "images/Q7/3-Hippopotamus.jpg", "images/Q7/4-Hyena.jpg"],
    explanation: "The saltwater crocodile has the strongest measured bite of any living animal."},

  // Source: https://www.jagranjosh.com/general-knowledge/list-of-tallest-grass-species-in-the-world-1820003380-1
  { id: 8,  text: "What is the tallest type of grass in the world?",
    options: ["Sugarcane", "Bamboo", "Pampas grass", "Elephant grass"],
    correct: "Bamboo",
    image: null,
    explanation: "Bamboo is the tallest grass in the world, reaching a height of 40m (131 ft)."},

  // Source: https://www.britannica.com/place/Titan-astronomy
  { id: 9,  text: "Titan, the only moon known to have clouds and a dense atmosphere, orbits which planet?",
    options: ["Jupiter", "Neptune", "Saturn", "Uranus"],
    correct: "Saturn",
    image: null,
    explanation: "Titan is the largest moon of Saturn, it is the only moon known to have clouds and a thick, dense atmosphere."},

  // Source: https://naplab.com/guides/how-long-do-snails-sleep/
  { id: 10, text: "Roughly how long can a snail hibernate or estivate at a stretch?",
    options: ["A few hours", "One day", "Several days", "Up to three years"],
    correct: "Up to three years",
    image: "images/Q10/1-Snail.jpg",
    explanation: "Snails can hibernate or estivate for extended periods, sometimes lasting up to three years."},

  // Source: https://www.britannica.com/animal/elephant-mammal
  { id: 11, text: "Which large land animal cannot jump?",
    options: ["Rhinoceros", "Hippopotamus", "Elephant", "Giraffe"],
    correct: "Elephant",
    image: ["images/Q11/1-Rhinoceros.jpg", "images/Q11/2-Hippopotamus.jpg", "images/Q11/3-Elephant.jpg", "images/Q11/4-Giraffe.jpg"],
    explanation: "The elephant is the only large land animal that cannot jump."},

  // Source: https://pmc.ncbi.nlm.nih.gov/articles/PMC3056458/
  { id: 12, text: "What is the fastest muscle in the human body?",
    options: ["The heart", "The eye (blink) muscles", "The calf", "The jaw"],
    correct: "The eye (blink) muscles",
    image: null,
    explanation: "The muscles that blink the eye are the fastest in the human body."},

  // Source: https://www.pbs.org/wgbh/nova/article/koala-fingerprints/
  { id: 13, text: "Which animal's fingerprints are so similar to a human's they can be confused at a crime scene?",
    options: ["Chimpanzee", "Gorilla", "Koala", "Orangutan"],
    correct: "Koala",
    image: null,
    explanation: "Koala fingerprints are so similar to human ones that they can be confused even under a microscope." },

  // Source: https://oceanservice.noaa.gov/facts/gbrlargeststructure.html
  { id: 14, text: "What is the largest living structure on Earth, visible from space?",
    options: ["The Amazon rainforest", "The Great Barrier Reef", "The Sahara", "Mount Everest"],
    correct: "The Great Barrier Reef",
    image: null,
    explanation: "The Great Barrier Reef is the largest living structure on Earth and can be seen from space."},

  // Source: https://americanshrimp.com/shrimp-school-why-shrimp-hearts-are-in-their-heads/
  { id: 15, text: "A shrimp's heart is located in its what?",
    options: ["Tail", "Abdomen", "Head", "Legs"],
    correct: "Head",
    image: "images/Q15/1-Shrimp.jpg",
    explanation: "A shrimp's heart is located in its head."},

  // Source: https://www.britannica.com/science/nitrogen
  { id: 16, text: "Which colorless, odorless gas makes up most of Earth's atmosphere?",
    options: ["Oxygen", "Carbon dioxide", "Nitrogen", "Argon"],
    correct: "Nitrogen",
    image: null,
    explanation: "Nitrogen is colorless, odorless, and it makes up about 78.09% of Earth's atmosphere."},

  // Source: https://www.sciencedirect.com/topics/veterinary-science-and-veterinary-medicine/autotomy
  { id: 17, text: "What is the term for some lizards' ability to detach their tails when threatened?",
    options: ["Autotomy", "Mitosis", "Molting", "Regeneration"],
    correct: "Autotomy",
    image: null,
    explanation: "Autotomy is the term for an animal shedding a body part, such as a lizard detaching its tail to escape a predator."},

  // Source: https://www.britannica.com/animal/lion
  { id: 18, text: "Which big cat typically spends 21 to 22 hours a day resting?",
    options: ["Lion", "Cheetah", "Tiger", "Leopard"],
    correct: "Lion",
    image: ["images/Q18/1-Lion.jpg", "images/Q18/2-Cheetah.jpg", "images/Q18/3-Tiger.jpg", "images/Q18/4-Leopard.jpg"],
    explanation: "Lions typically spend 21 to 22 hours a day resting, sleeping, or sitting and hunt for only 2 or 3 hours a day." },

  // Source: https://www.britannica.com/topic/honey
  { id: 19, text: "Honey never spoils mainly because of its very low what?",
    options: ["Temperature", "Sugar content", "Moisture content", "Acidity alone"],
    correct: "Moisture content",
    image: null ,
    explanation: "Honey never spoils mainly because of its very low moisture content, which stops microbes from growing."},

  // Source: https://kids.britannica.com/students/article/jellyfish/275144
  { id: 20, text: "Which sea creature has no brain and no heart?",
    options: ["Jellyfish", "Starfish", "Sea cucumber", "Octopus"],
    correct: "Jellyfish",
    image: null,
    explanation: "Jellyfish have no brain and no heart; they sense and move using a simple network of nerves."},

  // Source: https://www.britannica.com/place/Antarctica
  { id: 21, text: "Which continent has no native reptiles or snakes?",
    options: ["Australia", "Antarctica", "Europe", "South America"],
    correct: "Antarctica",
    image: null,
    explanation: "Antarctica is the only continent with no native reptiles or snakes, as it is far too cold for them."},

  // Source: https://www.britannica.com/science/How-Hot-Can-Lightning-Get
  { id: 22, text: "A bolt of lightning is roughly how many times hotter than the surface of the sun?",
    options: ["About the same", "Twice", "Around five times", "Around fifty times"],
    correct: "Around five times",
    // A lightning image illustrates the topic, but it cannot hint at the correct answer.
    image: "images/Q22/1-Lightning.jpg",
    explanation: "A lightning bolt can reach about five times the temperature of the sun's surface."},

  // Source: https://www.britannica.com/animal/peregrine-falcon
  { id: 23, text: "Which bird is the fastest animal on Earth?",
    options: ["Golden eagle", "Peregrine falcon", "Frigatebird", "Hawk"],
    correct: "Peregrine falcon",
    image: ["images/Q23/1-Golden_eagle.jpg", "images/Q23/2-Peregrine_falcon.jpg", "images/Q23/3-Frigatebird.jpg", "images/Q23/4-Hawk.jpg"],
    explanation: "The peregrine falcon is the fastest animal on Earth, reaching over 300 km/h."},

  // Source: https://kids.britannica.com/students/article/echidna/487704
  { id: 24, text: "What is a baby echidna called?",
    options: ["Joey", "Puggle", "Kit", "Calf"],
    correct: "Puggle",
    image: "images/Q24/1-Adult_echidna.jpg",
    explanation: "A baby echidna is called a 'puggle'." },

  // Source: https://www.livescience.com/57477-why-are-bananas-considered-berries.html
  { id: 25, text: "Botanically speaking, which of these is a berry?",
    options: ["Banana", "Strawberry", "Raspberry", "Cherry"],
    correct: "Banana",
    image: ["images/Q25/1-Banana.jpg", "images/Q25/2-Strawberry.jpg", "images/Q25/3-Raspberry.jpg", "images/Q25/4-Cherry.jpg"],
    explanation: "Botanically, a banana is a berry, but a strawberry, raspberry, and cherry are not. This is because a true berry grows from a flower with one ovary and holds its seeds in its flesh."},

  // Source: https://a-z-animals.com/articles/the-pasture-bffs-why-cows-get-stressed-when-separated-from-their-besties/
  { id: 26, text: "Cows form best-friend bonds and get stressed when separated, showing they are highly what?",
    options: ["Territorial", "Social", "Nocturnal", "Migratory"],
    correct: "Social",
    image: "images/Q26/1-Cows.jpg",
    explanation: "Cows are highly social animals: they form close friendships and show signs of stress when separated from their preferred companions."},

  // Source: https://www.britannica.com/science/mercury-chemical-element
  { id: 27, text: "Which metal is liquid at room temperature?",
    options: ["Lead", "Mercury", "Aluminum", "Tin"],
    correct: "Mercury",
    image: null,
    explanation: "Mercury is the only common metal that is liquid at room temperature."},

  // Source: https://www.britannica.com/one-good-fact/whats-unique-about-wombat-poop
  { id: 28, text: "Wombats are known for producing droppings of what unusual shape?",
    options: ["Spherical", "Cube-shaped", "Star-shaped", "Flat discs"],
    correct: "Cube-shaped",
    image: "images/Q28/1-Wombat.jpg",
    explanation: "Wombats are the only known animals to produce cube-shaped droppings."},

  // Source: https://www.britannica.com/science/What-Is-the-Loudest-Animal-on-Earth
  { id: 29, text: "What is the loudest animal on Earth?",
    options: ["Humpback whale", "Sperm whale", "Howler monkey", "Lion"],
    correct: "Sperm whale",
    image: ["images/Q29/1-Humpback_whale.jpg", "images/Q29/2-Sperm_whale.jpg", "images/Q29/3-Howler_monkey.jpg", "images/Q29/4-Lion.jpg"],
    explanation: "The sperm whale is the loudest animal on Earth, it can produce sounds that reach 230 decibels"},

  // Source: https://medium.com/did-you-know-short-fun-facts/science-animals-facts-c5077b2aa6ac
  { id: 30, text: "Which part of an ostrich is bigger than its brain?",
    options: ["Its heart", "Its eye", "Its stomach", "Its foot"],
    correct: "Its eye",
    image: "images/Q30/1-Ostrich.jpg",
    explanation: "An ostrich's eye is bigger than its brain; each eyeball is about the size of a billiard ball."},
];


