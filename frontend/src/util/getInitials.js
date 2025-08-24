export const getInitials = (name) => {
    const names = name.split(' ');
    return names.length >= 2 ? names[0][0].toUpperCase() + names[1][0].toUpperCase() : names[0][0].toUpperCase();
};
