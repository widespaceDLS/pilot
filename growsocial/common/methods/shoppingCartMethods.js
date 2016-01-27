Meteor.methods({
	// Add to shopping cart collection
	addCartSampleItems: function() {

		var order = {
      userId: Meteor.userId(),
			vendorName: "Missy's Backyard Pride",
      vendorEmail: 'email@vendor.sample',
			vendorUserId: '1',
			vendorBusinessId: null,
      vendorTotal: 75.10,
			products: [{
				quantity: 3,
				name: "Grandma's Heirloom Tomato",
				description: "Grandma went to great lengths to weave her heir on this loom",
        unitType: "pound",
				unitPrice: 4.20,
        photo: {src: "/images/user-images/AuntRubyTomato.png"},
				currency: 'USD',
				itemTotalPrice: 63.60,
			}, {
				quantity: 0.5,
				name: "Dad's Ghost Chilies",
				description: "Ask Dad why he is shivering",
				unitType: "pound",
				unitPrice: 3.00,
				currency: 'USD',
        photo: {src: "/images/user-images/ScarletNantesCarrot.png"},
				itemTotalPrice: 1.50,
			}, {
				quantity: 2,
				name: "Louise's Famous Strawberry Jam",
				description: "Mmmmm so sweet and fruity",
				unitType: "bottle",
				unitPrice: 5.00,
				currency: 'USD',
        photo: {src: "/images/user-images/LittleGemLettuce.png"},
				itemTotalPrice: 10.00,
			}]
		}
		// console.log('adding cart sample order:', order);
		ShoppingCart.insert(order);
  },

	// Adds an item to the shopping cart collection
	addCartItem: function(item) {

	    // TODO vendorEmail won't be exposed to the client (browser)
	    // TODO when not logged in, add session id

			// If vendor doesn't exist in collection
    	if (!Meteor.call('checkForVendor', item)) {
    		// Create the product structure
		    var product = {
				productId: item.productId,
				name: item.name,
				description: item.description,
				photo: item.photo,
				currency: item.currency,
				unitType: item.unitType,
				quantity: item.quantity,
				unitPrice: item.unitPrice,
				itemTotalPrice: item.quantity * item.unitPrice,
		    }

		    var vendorTotal = product.itemTotalPrice;

    		// Create the order structure
		    var order = {
				userId: Meteor.userId(),
				vendorUserId: item.vendorUserId,
				vendorBusinessId: item.vendorBusinessId,
				vendorName: item.vendorName,
				vendorLink: item.vendorLink,
				vendorEmail: item.vendorEmail,
				vendorTotal: vendorTotal,
				products: [ product, ],
		    }

		    // Add to collection
    		ShoppingCart.insert(order);
    	}
    	else {

    		// Get the product array
	    	var completeOrder = ShoppingCart.find({
          userId: Accounts.userId(), 
	    		vendorBusinessId: item.vendorBusinessId, 
					vendorUserId: item.vendorUserId,
				}, { 
					fields: { products: 1, }
				}).fetch();

	    	var orderProducts = completeOrder[0].products;

	    	for (var i = 0, len = orderProducts.length; i < len; i++) {
	    		if (orderProducts[i].productId == item.productId) {

	    			// Calculate the item's total price and vendor total
	    			var itp = orderProducts[i].itemTotalPrice + (item.quantity * item.unitPrice);

	    			// Update document with new quantity
	     			ShoppingCart.update({
            userId: Accounts.userId(), 
						vendorBusinessId: item.vendorBusinessId,
						vendorUserId: item.vendorUserId,
						"products.productId": item.productId,
						}, {
							$set: {
								"products.$.quantity": item.quantity,
								"products.$.itemTotalPrice": itp,
							}
						});
						break;
	    		}
	    		else {
	    			// Calculate the total price of the item
	    			var itemTotalPrice = item.quantity * item.unitPrice;

	    			// Add the product to the array
	    			ShoppingCart.update({
              userId: Accounts.userId(), 
	    				vendorBusinessId: item.vendorBusinessId,
    					vendorUserId: item.vendorUserId,
    				}, {
    					$addToSet: {
    						products: { 
								productId: item.productId,
								name: item.name,
								descrpition: item.description,
								photo: item.photo,
								currency: item.currency,
								unitType: item.unitType,
								quantity: item.quantity,
								unitPrice: item.unitPrice,
								itemTotalPrice: itemTotalPrice,
							}
						},
						$inc: {
							vendorTotal: itemTotalPrice,
						}
					});
					break;
	    		}
	    	}
    	}
	},

	// Increases or decreases the quantity and item's total price by 1
	// Increase: True, Decrease: False
	increaseOrDecrease: function(incOrDec, item) {
		var multiplier;
		if (incOrDec) {
			multiplier = 1;
		}
		else {
			multiplier = -1;
		}

		ShoppingCart.update({
          userId: Accounts.userId(), 
          "products.productId": item.productId},
				{$inc: {
					"products.$.quantity": (1 * multiplier), 
					"products.$.itemTotalPrice": (item.unitPrice * multiplier)
				}},
			);
	},

	// Checks if vendor exists in collection
	checkForVendor: function(_order) {
		
		if (ShoppingCart.findOne({userId: Accounts.userId(), vendorUserId: _order.vendorUserId}) ||
			ShoppingCart.findOne({userId: Accounts.userId(), vendorBusinessId: _order.vendorBusinessId})) {
			return true;
		}
		return false;
	},

	// Assigns the userId to all the carts
	assignUserId: function(user) {
		ShoppingCart.update(
			{userId: null},
			{$set: {userId: Accounts.userId()}},
		);
	},

	// Removes the item from the cart
	removeFromCart: function(item) {
		ShoppingCart.update(
			{ userId: Accounts.userId(), },
			{ $pull: { products: item }},
			{ multi: true },
			function() { console.log("Item removed") }
		);

		//TODO: If products array has 0 items, remove vendor from collection
	},
});
