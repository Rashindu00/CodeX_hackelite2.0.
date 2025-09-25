// Test specialist recommendation logic
const specialistKeywords = {
  'cardiology': ['heart', 'cardiac', 'cardiovascular', 'chest pain', 'cardiology', 'cardiologist'],
  'dermatology': ['skin', 'rash', 'acne', 'dermatology', 'dermatologist'],
  'endocrinology': ['diabetes', 'thyroid', 'hormone', 'endocrinology', 'endocrinologist'],
  'gastroenterology': ['stomach', 'digestive', 'abdominal', 'gastro', 'gastroenterology', 'gastroenterologist', 'nausea', 'vomiting', 'diarrhea'],
  'neurology': ['brain', 'neurological', 'headache', 'migraine', 'neurology', 'neurologist'],
  'orthopedics': ['bone', 'joint', 'muscle', 'orthopedic', 'orthopedics', 'orthopedist'],
  'psychiatry': ['mental', 'depression', 'anxiety', 'psychiatry', 'psychiatrist'],
  'pulmonology': ['lung', 'respiratory', 'breathing', 'cough', 'pulmonology', 'pulmonologist'],
  'urology': ['urinary', 'kidney', 'bladder', 'urology', 'urologist'],
  'gynecology': ['gynecological', 'women', 'gynecology', 'gynecologist'],
  'pediatrics': ['child', 'children', 'pediatric', 'pediatrics', 'pediatrician'],
  'ophthalmology': ['eye', 'vision', 'sight', 'ophthalmology', 'ophthalmologist'],
  'ENT': ['ear', 'nose', 'throat', 'ENT', 'otolaryngology'],
  'oncology': ['cancer', 'tumor', 'oncology', 'oncologist']
};

const specialists = {
  'cardiology': 'Cardiologist - Heart and cardiovascular diseases',
  'dermatology': 'Dermatologist - Skin, hair, and nail conditions',
  'endocrinology': 'Endocrinologist - Hormonal and metabolic disorders',
  'gastroenterology': 'Gastroenterologist - Digestive system issues',
  'neurology': 'Neurologist - Brain and nervous system disorders',
  'orthopedics': 'Orthopedist - Bone, joint, and muscle problems',
  'psychiatry': 'Psychiatrist - Mental health conditions',
  'pulmonology': 'Pulmonologist - Lung and respiratory issues',
  'urology': 'Urologist - Urinary system and male reproductive health',
  'gynecology': 'Gynecologist - Women\'s reproductive health',
  'pediatrics': 'Pediatrician - Children\'s health',
  'ophthalmology': 'Ophthalmologist - Eye and vision problems',
  'ENT': 'ENT Specialist - Ear, nose, and throat conditions',
  'oncology': 'Oncologist - Cancer treatment and care'
};

// Test cases
const testCases = [
  {
    message: "I have stomachache",
    expected: "gastroenterology"
  },
  {
    message: "I have chest pain",
    expected: "cardiology"
  },
  {
    message: "I have headache",
    expected: "neurology"
  },
  {
    message: "I have ear pain",
    expected: "ENT"
  }
];

console.log("Testing specialist recommendation logic...\n");

testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: "${testCase.message}"`);
  
  const specialistRecommendations = [];
  Object.keys(specialistKeywords).forEach(specialty => {
    const keywords = specialistKeywords[specialty];
    const messageAndResponse = testCase.message.toLowerCase();
    
    const hasMatch = keywords.some(keyword => 
      messageAndResponse.includes(keyword.toLowerCase())
    );
    
    if (hasMatch) {
      specialistRecommendations.push({
        specialty,
        description: specialists[specialty]
      });
    }
  });
  
  console.log("Recommended specialists:");
  specialistRecommendations.forEach(rec => {
    console.log(`- ${rec.specialty}: ${rec.description}`);
  });
  
  const hasExpected = specialistRecommendations.some(rec => rec.specialty === testCase.expected);
  console.log(`✅ Expected ${testCase.expected}: ${hasExpected ? 'FOUND' : 'NOT FOUND'}`);
  console.log("");
});

console.log("Test completed!");