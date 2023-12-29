function capitalizeFirstLetter(inputString) {
    // Check if the input is a valid string
    if (typeof inputString !== 'string') {
        return 'Invalid input';
    }

    // Capitalize the first letter and convert the rest to lowercase
    const resultString = inputString.charAt(0).toUpperCase() + inputString.slice(1).toLowerCase();

    return resultString;
}

export default capitalizeFirstLetter;