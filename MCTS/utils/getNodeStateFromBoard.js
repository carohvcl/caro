const base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+=";
function normalizeArray(array) {
  // Normalize the array by adding 1 to each element
  const normalizedArray = array.map(value => value + 1);

  return normalizedArray;
}
function calculateUniqueNumber(numberArray) {
  // Convert each number to a base-3 string representation
  const base3String = numberArray.map(num => num.toString(3)).join(''); 
  // Convert the base-3 string to a base-10 integer
  return parseInt(base3String, 3);
}
function numberToBase64(number) {
  let result = '';

  // Repeatedly divide by 64 and encode remainders
  while (number > 0) {
      result = base64Chars[number % 64] + result;
      number = Math.floor(number / 64);
  }

  return result;
}


module.exports =(array2D)=> {
  let encodedString = '';

  array2D.forEach(numberArray => {
      const normalizedArray = normalizeArray(numberArray); // Normalize
      const uniqueNumber = calculateUniqueNumber(normalizedArray);
      const base64String = numberToBase64(uniqueNumber);
      encodedString += base64String;
  });

  return encodedString;
}