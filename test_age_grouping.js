// Test script for the new age grouping function
// This can be run with: node test_age_grouping.js

// Mock data for testing
const mockResidents = [
    { date_of_birth: '2024-01-15', gender: 'male' },    // 0-5 mos
    { date_of_birth: '2023-08-15', gender: 'female' },  // 0-11 mos
    { date_of_birth: '2023-01-15', gender: 'male' },    // 1 Y.O
    { date_of_birth: '2022-01-15', gender: 'female' },  // 2 Y.O
    { date_of_birth: '2021-01-15', gender: 'male' },    // 3 Y.O
    { date_of_birth: '2020-01-15', gender: 'female' },  // 4 Y.O
    { date_of_birth: '2019-01-15', gender: 'male' },    // 5 Y.O
    { date_of_birth: '2018-01-15', gender: 'female' },  // 6 Y.O
    { date_of_birth: '2017-01-15', gender: 'male' },    // 7 Y.O
    { date_of_birth: '2016-01-15', gender: 'female' },  // 8 Y.O
    { date_of_birth: '2015-01-15', gender: 'male' },    // 9 Y.O
    { date_of_birth: '2014-01-15', gender: 'female' },  // 10 Y.O
    { date_of_birth: '2010-01-15', gender: 'male' },    // 11-20 Y.O
    { date_of_birth: '2000-01-15', gender: 'female' },  // 21-30 Y.O
    { date_of_birth: '1990-01-15', gender: 'male' },    // 31-40 Y.O
    { date_of_birth: '1980-01-15', gender: 'female' },  // 41-50 Y.O
    { date_of_birth: '1970-01-15', gender: 'male' },    // 51-60 Y.O
    { date_of_birth: '1960-01-15', gender: 'female' },  // 60+ Y.O
  ];
  
  // Age grouping function (copied from the updated code)
  const generateDetailedAgeGrouping = (residentsData) => {
    const ageGroups = {};
  
    residentsData.forEach((resident) => {
      const birthDate = new Date(resident.date_of_birth);
      const today = new Date();
      const ageInMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth());
      const ageInYears = Math.floor(ageInMonths / 12);
      const gender = resident.gender?.toLowerCase();
  
      let ageGroup = '';
      
      // Determine age group based on months/years
      if (ageInMonths <= 5) {
        ageGroup = '0-5 mos';
      } else if (ageInMonths <= 11) {
        ageGroup = '0-11 mos';
      } else if (ageInYears === 1) {
        ageGroup = '1 Y.O';
      } else if (ageInYears === 2) {
        ageGroup = '2 Y.O';
      } else if (ageInYears === 3) {
        ageGroup = '3 Y.O';
      } else if (ageInYears === 4) {
        ageGroup = '4 Y.O';
      } else if (ageInYears === 5) {
        ageGroup = '5 Y.O';
      } else if (ageInYears === 6) {
        ageGroup = '6 Y.O';
      } else if (ageInYears === 7) {
        ageGroup = '7 Y.O';
      } else if (ageInYears === 8) {
        ageGroup = '8 Y.O';
      } else if (ageInYears === 9) {
        ageGroup = '9 Y.O';
      } else if (ageInYears === 10) {
        ageGroup = '10 Y.O';
      } else if (ageInYears >= 11 && ageInYears <= 20) {
        ageGroup = '11-20 Y.O';
      } else if (ageInYears >= 21 && ageInYears <= 30) {
        ageGroup = '21-30 Y.O';
      } else if (ageInYears >= 31 && ageInYears <= 40) {
        ageGroup = '31-40 Y.O';
      } else if (ageInYears >= 41 && ageInYears <= 50) {
        ageGroup = '41-50 Y.O';
      } else if (ageInYears >= 51 && ageInYears <= 60) {
        ageGroup = '51-60 Y.O';
      } else if (ageInYears >= 61) {
        ageGroup = '60+ Y.O';
      }
  
      if (ageGroup) {
        if (!ageGroups[ageGroup]) {
          ageGroups[ageGroup] = { male: 0, female: 0, total: 0 };
        }
  
        if (gender === "male" || gender === "m") {
          ageGroups[ageGroup].male++;
        } else if (gender === "female" || gender === "f") {
          ageGroups[ageGroup].female++;
        }
        ageGroups[ageGroup].total = ageGroups[ageGroup].male + ageGroups[ageGroup].female;
      }
    });
  
    return ageGroups;
  };
  
  // Test the function
  console.log('Testing Age Grouping Function');
  console.log('============================');
  
  const result = generateDetailedAgeGrouping(mockResidents);
  
  // Define the expected order
  const ageGroupOrder = [
    '0-5 mos', '0-11 mos', '1 Y.O', '2 Y.O', '3 Y.O', '4 Y.O', '5 Y.O', 
    '6 Y.O', '7 Y.O', '8 Y.O', '9 Y.O', '10 Y.O', '11-20 Y.O', '21-30 Y.O', 
    '31-40 Y.O', '41-50 Y.O', '51-60 Y.O', '60+ Y.O'
  ];
  
  console.log('\nAge Group Distribution Table');
  console.log('============================');
  console.log('Age Groups\t\tM\tF\tTotal');
  console.log('----------------------------------------');
  
  let totalMale = 0;
  let totalFemale = 0;
  let grandTotal = 0;
  
  ageGroupOrder.forEach(ageGroup => {
    const group = result[ageGroup] || { male: 0, female: 0, total: 0 };
    console.log(`${ageGroup.padEnd(20)}\t${group.male}\t${group.female}\t${group.total}`);
    totalMale += group.male;
    totalFemale += group.female;
    grandTotal += group.total;
  });
  
  console.log('----------------------------------------');
  console.log(`Total\t\t\t${totalMale}\t${totalFemale}\t${grandTotal}`);
  
  console.log('\nTest completed successfully!');