// Test the fuzzy matching function
const areNamesSimilar = (name1, name2) => {
  const normalize = (str) => str.toLowerCase().trim();
  const n1 = normalize(name1);
  const n2 = normalize(name2);

  console.log(`Testing: "${n1}" vs "${n2}"`);

  // Exact match
  if (n1 === n2) {
    console.log('✅ Exact match');
    return true;
  }

  // Check for substring match of 5+ characters
  if (n1.length >= 5 && n2.includes(n1)) {
    console.log('✅ n1 contains n2');
    return true;
  }
  if (n2.length >= 5 && n1.includes(n2)) {
    console.log('✅ n2 contains n1');
    return true;
  }

  // Check for common substrings of 5+ characters
  for (let i = 0; i <= n1.length - 5; i++) {
    const substring = n1.substring(i, i + 5);
    console.log(`Checking substring: "${substring}"`);
    if (n2.includes(substring)) {
      console.log(`✅ Found matching substring: "${substring}"`);
      return true;
    }
  }

  console.log('❌ No match found');
  return false;
};

// Test your specific case
console.log('=== Test Case 1 ===');
const result1 = areNamesSimilar("Mummy Return", "Mummy Return 7/36");

console.log('\n=== Test Case 2 ===');
const result2 = areNamesSimilar("Rent", "Rental");

console.log('\n=== Test Case 3 ===');
const result3 = areNamesSimilar("Internet", "Internet Bill");

console.log(`\nResults:
- "Mummy Return" vs "Mummy Return 7/36": ${result1}
- "Rent" vs "Rental": ${result2}
- "Internet" vs "Internet Bill": ${result3}`);