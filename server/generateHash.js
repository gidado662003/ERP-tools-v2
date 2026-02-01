const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Enter your desired admin password: ', (password) => {
    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, function (err, hash) {
        if (err) {
            console.error('Error hashing password:', err);
        } else {
            console.log('Hashed Password (copy this to your .env file):');
            console.log(hash);
        }
        rl.close();
    });
});