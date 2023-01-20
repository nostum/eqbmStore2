const ShopifyCartURLs = [
  "/cart/add",
  "/cart/update",
  "/cart/change",
  "/cart/clear",
  "/cart/add.js",
  "/cart/update.js",
  "/cart/change.js",
  "/cart/clear.js"
  ];
  
  function isShopifyCartURL(url) {
  if (!url) return false;
  const path = url.split("/").pop();
  return ShopifyCartURLs.includes(`/cart/${path}`);
  }
  
  //shopify api interacts with stringify payload
  //this functions parse payload into json
  function parsePayload(payloadString) {
  if (payloadString.hasOwnProperty("body")) {
  return JSON.parse(payloadString.body);
  }
  return null;
  }
  
  
  function getMetafieldLimits() {
  
    fetch(`${window.location.origin}/cart?view=alternative`)
    .then(res=>
      res.json().then(data=>{
        console.log("metas", data)
        window.productLimit = data.metafields
        console.log(window.productLimit)
      })
      )
    
  
  
  }//
  
  // checks if request is increasing items or adding items as far those are the only two options
  // to add items in shopify.
  //functions check which of the two possible addition items is being called in fetch 
  function isAddRequest(payloadString, cartItems, productLimit) {
  console.log(payloadString)
  const parsedPayload = parsePayload(payloadString);
  if (parsedPayload) {
    //all cart request differents to Add.js recieves a payload object with the properties
    // line and quantiy 
    // check if this is a change/update request 
  if (parsedPayload.hasOwnProperty("line")) {
    // item line position means the place in the cart arrays each item has. Last added and first array position by default
  const itemLinePosition = parseInt(parsedPayload.line);
  const itemId = cartItems[itemLinePosition - 1].id;
  console.log("ppr",typeof(productLimit.metafields) )
  const itemLimit = productLimit.find(el => el[itemId])[itemId].qty;
  const cartItemIndex = cartItems.findIndex(ci => ci.id === itemId);
  if (parsedPayload.quantity > itemLimit) {
    window.initialShopifyCart.items[cartItemIndex].quantity += 1;
  } else {
    window.initialShopifyCart.items[cartItemIndex].quantity = parsedPayload.quantity;
    //if property quantity sets product to 0, then delete the item from local variable cart
    window.initialShopifyCart.items = window.initialShopifyCart.items.filter(i=>i.quantity !== 0)
    console.log("cartafterdeleteitem", window.initialShopifyCart.items)
  }
  return parsedPayload.quantity > itemLimit;
  } else if (parsedPayload.hasOwnProperty("id") && cartItems.length) {
  console.log("parsedPayload", parsedPayload);
  const itemId = parseInt(parsedPayload.id);
  const itemLimit = !!productLimit.find(i => i[itemId]) ? productLimit.find(i => i[itemId])[itemId].qty : 99;
  console.log(cartItems ,cartItems.find(e => e.id === itemId) !== undefined)
  let itemCurrentQuantity
  if(cartItems.find(e => e.id === itemId) !== undefined){
    itemCurrentQuantity = cartItems.find(e => e.id === itemId).quantity
  }else itemCurrentQuantity = 0
  const cartItemIndex = cartItems.findIndex(ci => ci.id === itemId);
  console.log(cartItemIndex)
  cartItemIndex !== -1 ? window.initialShopifyCart.items[cartItemIndex].quantity += 1 : window.initialShopifyCart.items.unshift({variant_id:itemId, quantity:1, id:itemId})
  console.log("enter 81")
  //using settimeout to allow add.js promise resolve and then fetch last cart state metafields
  // fetching metafields without settimeout return an empty metafields array even if items were add
  setTimeout(getMetafieldLimits,700)
  //getMetafieldLimits()
  return itemCurrentQuantity + 1> itemLimit;
  }else if(parsedPayload.hasOwnProperty("id") && !cartItems.length){
  const itemId = parseInt(parsedPayload.id);
  window.initialShopifyCart.items.unshift({id:itemId, variant_id:itemId, quantity:1})
  console.log("enter 87")
  console.log("87",window.initialShopifyCart.items)
  window.dispatchEvent(new CustomEvent("Shopify-add",{
    detail:{
      name:'added-product'
    }
  }))
  setTimeout(getMetafieldLimits,700)
  // getMetafieldLimits(window.initialShopifyCart.items)
  }
  }
  return false;
  }
  
  
  
  
  // gets the last cart state and sets the data in a global variable in order to handle data
  // depending in requests and user cart interactions
  //this is executed in the window load
  function getLastCartState() {
  fetch(`${window.location.origin}/cart.js`)
  .then(res =>
    res.json().then(data => {
      const localcart = data;
      console.log("localCart", localcart);
      window.initialShopifyCart = localcart;
  
      //
      
  getMetafieldLimits(localcart.items)
  //
    })
  );
  }
  window.addEventListener("Shopify-add",()=>{
    console.log("fired by listener")
  })
  window.addEventListener("load", getLastCartState);
  
  //customize fetch in order to intercept and handle responses related to Shopify Cart
  //this just have effect on add/change requests and returns original fetch method
  //for other requests
  function fetchOverride() {
  if (!window.fetch || typeof window.fetch !== "function") return;
  
  const originalFetch = window.fetch;
  window.fetch = function() {
  let response;
  
  
  if (
    isShopifyCartURL(arguments[0]) &&
    arguments.length > 1 &&
    isAddRequest(arguments[1], window.initialShopifyCart.items, window.productLimit)
  ) {
    console.log("arguments", arguments);
    //alert("nop")
    let modal = document.getElementById('myModal')
    modal.style.display = 'flex'
    return Promise.resolve({
      status: 400,
      json: () =>
        Promise.resolve({
          status: 422,
          message:"Cart Error",
          description: "You cannot add more than the maximum allowed quantity to the cart."
        })
    });
  }
    else{
      
      response = originalFetch.apply(this, arguments)
  
    }
    
    return response;
  };
  }
  
  fetchOverride();
  
  
  
  
  
  window.addEventListener("click", function(event) {
  let modal = document.getElementById('myModal')
  if (event.target == modal) {
    modal.style.display = "none";
  }
  });
  
  function closeModal() {
  let modal = document.getElementById("myModal");
  modal.style.display = "none";
  }