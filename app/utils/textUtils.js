export const processText = (inputText) => {
    if (!inputText) return "";
    // Replace "text" with span having primary color
    let processed = inputText.replace(
        /"(.*?)"/g,
        '<span style="font-weight: bold;">$1</span>'
    );

    return processed;
};
