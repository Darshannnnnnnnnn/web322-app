const { Item, Category } = require('./models'); // Adjust the path based on where your models are located

module.exports.initialize = async function () {
    // Sequelize automatically syncs models with the database when the app starts
    try {
        await Item.sync();
        await Category.sync();
    } catch (err) {
        throw new Error(`Failed to sync models: ${err.message}`);
    }
}

module.exports.getItemById = function(id){
    return Item.findByPk(id)
        .then(item => {
            if (item) {
                return item;
            } else {
                throw new Error("No result returned");
            }
        });
}

module.exports.getAllItems = function(){
    return Item.findAll()
        .then(items => {
            if (items.length > 0) {
                return items;
            } else {
                throw new Error("No results returned");
            }
        });
}

module.exports.getPublishedItems = function(){
    return Item.findAll({ where: { published: true } })
        .then(items => {
            if (items.length > 0) {
                return items;
            } else {
                throw new Error("No results returned");
            }
        });
}

module.exports.getCategories = function(){
    return Category.findAll()
        .then(categories => {
            if (categories.length > 0) {
                return categories;
            } else {
                throw new Error("No results returned");
            }
        });
}

module.exports.addItem = function(itemData){
    // Ensure published is a boolean
    itemData.published = itemData.published ? true : false;

    // Create new item in the database
    return Item.create(itemData)
        .then(item => item)
        .catch(err => { throw new Error(`Failed to add item: ${err.message}`); });
}

module.exports.getItemsByCategory = function(category){
    return Item.findAll({ where: { category: category } })
        .then(items => {
            if (items.length > 0) {
                return items;
            } else {
                throw new Error("No results returned");
            }
        });
}

module.exports.getItemsByMinDate = function(minDateStr) {
    return Item.findAll({ where: { postDate: { [Op.gte]: new Date(minDateStr) } } })
        .then(items => {
            if (items.length > 0) {
                return items;
            } else {
                throw new Error("No results returned");
            }
        });
}

module.exports.getPublishedItemsByCategory = function(category){
    return Item.findAll({ where: { published: true, category: category } })
        .then(items => {
            if (items.length > 0) {
                return items;
            } else {
                throw new Error("No results returned");
            }
        });
}
