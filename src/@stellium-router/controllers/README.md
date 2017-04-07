## Reserved URLs


## Reserved Template Variables

#### Products

`$_shoppingCartItems`
Access to all items in the shopping cart for the current session
```javascript
$_shoppingCartItems = [
	{
		variant_id: "", // ObjectId to the variant document
		variant: [Object variant], // The variant document populated as Object
		quantity: 2, // The quantity of the item in the cart
		customer_id: "", // ObjectId to the customer if logged in with a customer account, ref to `EcommerceCustomer`
	}
]
```

`$_cartTotal`
Returns the total value of the contents in the shopping cart

`$_authUser`
Access to the currently authenticated user (if authenticated). Returns false if user is not authenticated.

``