// comma notation
export const numToCurString = (num, decimal) => {
    //RegExp translation: global non-word boundaries,
    //which are followed by one or more groups of three digits, then either a dot or word boundary
    return (num.toFixed(decimal).replace(/\B(?=((\d{3,3})+(\.|\b)))/g, ","));
};