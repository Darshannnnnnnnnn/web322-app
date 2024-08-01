module.exports = (sequelize, DataTypes) => {
    const Item = sequelize.define('Item', {
      title: DataTypes.STRING,
      body: DataTypes.TEXT,
      category: DataTypes.STRING,
      price: DataTypes.FLOAT,
      published: DataTypes.BOOLEAN,
      postDate: DataTypes.DATE,
      featureImage: DataTypes.STRING
    });
    return Item;
  };
  