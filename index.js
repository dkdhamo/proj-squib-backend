const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb+srv://Dkdhamo:Dhamo%40123@cluster0.7hdof.mongodb.net/product_stories', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));
  





  

// Define a User schema
const userSchema = new mongoose.Schema({
  email: String,
  name: String,
  brandName: String,
  logoUrl: String,
});

const User = mongoose.model('User', userSchema);

// Signup route
app.post('/signup', async (req, res) => {
  try {
    const { email, name } = req.body;
    

    const newUser = new User({ email, name });
    await newUser.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//update-brand-info
app.post('/update-brand-info', async (req, res) => {
  try {
    const { email, brandName, logoUrl } = req.body;

    // Find the user by their email and update the brand info
    await User.findOneAndUpdate(
      { email },
      { brandName, logoUrl }
    );

    res.status(200).json({ message: 'Brand info updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update brand info' });
  }
});

//checkin brand-info

app.get('/checkUser',async  (req, res) => {
  const userEmail = req.query.email;

  const user =  await User.findOne({email: userEmail});

  if (user) {
    
    const hasBrandInfo= Boolean(user.brandName&&user.logoUrl);
    res.json({ exists: true,hasBrandInfo: hasBrandInfo });
  } else {
    res.json({ exists: false });
  }
});

// signin route
app.post('/signin', async (req, res) => {
    try {
      const { email, name} = req.body;
  
      const user = await User.findOne({ email });
      
      if (!user) {
        return res.json({ message: 'no user found' });
      }  
      // Generate a JWT token
      const token = jwt.sign({ userId: user._id }, 'your-secret-key');
      
      res.json({ token, brandName: user.brandName,userId:user._id.toString(),logo:user.logoUrl});
  
      
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });








const productSchema = new mongoose.Schema({
  userId: String,
  brandName: String,
  products: [{
    productId: String,
    productName: String,
    productDetails: String,
    productImageUrl: String,
    productStoryUrl:[String],
  }]
});

const Product = mongoose.model('Products', productSchema);

app.get('/getproducts/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const products = await Product.findOne({ userId });
    
    if (!products) {
      return res.status(404).json({ message: 'User products not found' });
    }
    const productsArray = products.products;
    
    res.json(productsArray);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//get product story url

app.get('/getstories/:brandName/:productId', async (req, res) => {
  try {
    const brandName = req.params.brandName;
    const productId = req.params.productId;

    const products = await Product.findOne({ brandName });
    if (!products) {
      return res.status(404).json({ message: 'brand not found' });
    }

    const productsArray = products.products;
    const tarProduct = productsArray.find(product => product.productId == productId);

    if (!tarProduct) {
      return res.status(404).json({ message: 'product not found' });
    }

    const productStoryUrlArray = tarProduct.productStoryUrl;

    console.log(productStoryUrlArray);

    res.json({"productStoryUrls":productStoryUrlArray});
    
  } catch (error) {
    res.json({ "message": error.message });
  }
});

//add story
app.post('/uploadstory',async (req, res) => {
  try {
    const {userId,productId,storyImageUrl} =req.body;
    console.log(storyImageUrl);
    const products = await Product.findOne({ userId });

    if (!products) {
      return res.status(404).json({ message: 'User products not found' });
    }
    const productsArray = products.products;
    const tarproduct=productsArray.find(productsArray=>productsArray.productId==productId);
    console.log(tarproduct);

    tarproduct.productStoryUrl.push(storyImageUrl);
    await products.save();
    

    res.json(tarproduct);



    
  } catch (error) {

    res.status(500).json({ error: error.message });
  }
});

// Add Product route
app.post('/addProduct', async (req, res) => {
  try {
    const { productId, productName, productDetails, productImageUrl, brandName, userId } = req.body;

    let productData = {
      productId,
      productName,
      productDetails,
      productImageUrl,
    };

    let existingProductData = await Product.findOne({ userId });

    if (existingProductData) {
      existingProductData.products.push(productData);
      await existingProductData.save();
    } else {
      existingProductData = new Product({
        userId,
        brandName,
        products: [productData],
      });
      await existingProductData.save();
    }

    res.status(201).json({ message: 'Product added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
