import mongoose from 'mongoose';

const shopOrderItemSchema = new mongoose.Schema({
    item: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Item', 
        required: true 
    },
    price: Number,
    quantity: { 
        type: Number, 
        required: true, 
        min: 1 
    }
},{timestamps: true});

const shopOrderSchema = new mongoose.Schema({
    shop: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Shop', 
        required: true 
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true
    },
    subtotal:{
        type: Number,
    },
    shopOrderItems:[shopOrderItemSchema]

},{timestamps: true}); 

const orderSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true
        },
    paymentMethod: { 
        type: String,
        enum: ['cod', 'online'],
        required: true
    },
    deliveryAddress:{
        text: String,
        latitude: Number,
        longitude: Number
    },
    totalAmount: { 
        type: Number, 
        required: true 
    },
    shopOrder:[shopOrderSchema],

    
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

export default Order;