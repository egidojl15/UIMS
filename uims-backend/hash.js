const bcrypt = require('bcryptjs');

// The password you want to hash
const password = 'secretary';

// A "salt" is a random string added to the password before hashing.
// The higher the number, the more secure the hash, but it also takes longer to generate.
const saltRounds = 10;

bcrypt.hash(password, saltRounds, function(err, hash) {
    if (err) {
        console.error("Error generating hash:", err);
    } else {
        console.log("Password hash for 'secretary':");
        console.log(hash);
    }
});
