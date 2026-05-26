export const parseBody = (event) => {
    if (!event.body)
        throw new Error('Request body is missing');
    return JSON.parse(event.body);
};
