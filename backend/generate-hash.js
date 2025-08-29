const bcrypt = require('bcryptjs');

const password = 'Nandighosh@3211';
const hash = bcrypt.hashSync(password, 10);

console.log('Password:', password);
console.log('Hashed:', hash);
