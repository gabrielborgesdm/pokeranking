
interface User {
    name: string
    age: number
}

function saveUserToDatabase(user: User) {
    console.log('hi', user.name)
}

saveUserToDatabase({ name: 'Rodrigo', age: 22 })