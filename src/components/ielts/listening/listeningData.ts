export const sections = [
    {
      title: "Part 1: Transport survey",
      description: "A conversation between a student and a housing officer about student accommodation",
      questions: [
        {
          id: "l1q1",
          type: "form-completion",
          text: "Name : \t\t Sadie Jones \n Year of birth: \t\t 1991 \n Postcode: \t\t 1: ",
          maxLength: 8
        },
        {
          id: "l1q2",
          type: "form-completion",
          text: "Travelling by bus \n Date of bus journey: \t\t 2: ",
          maxLength: 8
        },
        {
          id: "l1q3",
          type: "form-completion",
          text: "Reason for trip: \t\t shopping and visit to the 3: ",
          maxLength: 8
        },
        {
          id: "l1q4",
          type: "form-completion",
          text: "Travelled by bus because cost of 4:_____________ too high",
          maxLength: 8
        },
        {
          id: "l1q5",
          type: "form-completion",
          text: "Got on bus at \t\t 5: ",
          maxLength: 8
        },
        {
          id: "l1q2",
          type: "multiple-choice",
          text: "Preferred accommodation type:",
          options: [
            "Single room",
            "Shared room",
            "Studio apartment",
            "Family housing"
          ]
        },
        {
          id: "l1q3",
          type: "form-completion",
          text: "Maximum monthly budget: £",
          maxLength: 4
        }
      ]
    },
    {
      title: "Section 2: Public Information",
      description: "A guided tour of a historical building",
      questions: [
        {
          id: "l2q1",
          type: "map-completion",
          text: "Mark the location of the main entrance on the map",
          image: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80"
        },
        {
          id: "l2q2",
          type: "multiple-choice",
          text: "When was the building first opened?",
          options: ["1856", "1867", "1878", "1889"]
        },
        {
          id: "l2q3",
          type: "matching",
          text: "Match the rooms with their original purposes:",
          options: [
            "Great Hall - Public gatherings",
            "West Wing - Administrative offices",
            "East Tower - Observatory"
          ]
        }
      ]
    },
    {
      title: "Section 3: Educational Context",
      description: "A discussion between two students about their research project",
      questions: [
        {
          id: "l3q1",
          type: "multiple-choice",
          text: "What is the main focus of their research?",
          options: [
            "Urban development",
            "Climate change",
            "Social behavior",
            "Economic trends"
          ]
        },
        {
          id: "l3q2",
          type: "form-completion",
          text: "Project deadline:",
          maxLength: 10
        },
        {
          id: "l3q3",
          type: "matching",
          text: "Match each task with the responsible student:",
          options: [
            "Data collection",
            "Literature review",
            "Statistical analysis"
          ]
        }
      ]
    },
    {
      title: "Section 4: Academic Lecture",
      description: "A lecture on marine biology and ecosystem conservation",
      questions: [
        {
          id: "l4q1",
          type: "multiple-choice",
          text: "What is the main threat to coral reefs according to the lecture?",
          options: [
            "Ocean acidification",
            "Rising temperatures",
            "Plastic pollution",
            "Overfishing"
          ]
        },
        {
          id: "l4q2",
          type: "form-completion",
          text: "The percentage of marine species dependent on coral reefs:",
          maxLength: 2
        },
        {
          id: "l4q3",
          type: "matching",
          text: "Match the conservation methods with their primary benefits:",
          options: [
            "Marine protected areas",
            "Artificial reefs",
            "Sustainable fishing practices"
          ]
        }
      ]
    }
  ];