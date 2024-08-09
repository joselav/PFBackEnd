const fr = require("@faker-js/faker");

const generateProducts = () =>{
    return{
        id: fr.faker.database.mongodbObjectId(),
        title: fr.faker.commerce.productName(),
        description: fr.faker.commerce.productDescription(),
        price: fr.faker.commerce.price(),
        thumbnail: [],
        code: fr.faker.lorem.word(),
        stock:fr.faker.number.int({max:150}),
        category: fr.faker.commerce.productAdjective()
    }
}


module.exports= generateProducts;