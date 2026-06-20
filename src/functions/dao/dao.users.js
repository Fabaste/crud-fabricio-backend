const calculateAge = async (users) => {
    const today = new Date();

    for (const user of users) {
        const birthDate = new Date(user.fechaNacimiento);
        let edad = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();

        if (
            monthDifference < 0 ||
            (monthDifference === 0 && today.getDate() < birthDate.getDate())
        ) {
            edad--;
        }

        user.edad = edad;
    }

    return users;
}

export default calculateAge