const base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+=";
function base64ToNumber(base64String) {
    let result = 0;
    let power = 1;

    // Process characters from right to left
    for (let i = base64String.length - 1; i >= 0; i--) {
        const index = base64Chars.indexOf(base64String[i]);
        result += index * power;
        power *= 64;
    }

    return result;
}
function numberToBase3Array(number) {
    let base3String = number.toString(3);
    // Pad with zeros at the beginning to ensure length of 15
    base3String = base3String.padStart(15, '0');
    return base3String.split('').map(Number);
}
function denormalizeArray(array) {
    // Normalize the array by adding 1 to each element
    const normalizedArray = array.map(value => value - 1);

    return normalizedArray;
}
module.exports = (encodedString)=> {
    const array2D = [];
    const chunkSize = 4;

    // Split the encoded string into chunks of 4 
    for (let i = 0; i < encodedString.length; i += chunkSize) {
        const base64String = encodedString.substring(i, i + chunkSize);
        const number = base64ToNumber(base64String);
        const numberArray = numberToBase3Array(number);
        const denormalizedArray = denormalizeArray(numberArray); // Denormalize
        array2D.push(denormalizedArray);
    }

    return array2D;
}
