function capitalizeFirstLetter(inputString) {
    
    if (typeof inputString !== 'string') {
        return 'Invalid input';
    }

    
    const resultString = inputString.charAt(0).toUpperCase() + inputString.slice(1).toLowerCase();

    return resultString;
}

export default capitalizeFirstLetter;