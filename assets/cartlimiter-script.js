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
    
    
    function getMetafieldLimits(lastCart) {
    
    const storeName = 'equilibriumtestinglab';
    const productId = '40120367186106';
    const saccesstoken = 'xxxxxxxxxxxxxxxx'
    
    const items = lastCart
    console.log("itemsxd", items)
    
    let itemsLimitsArray = []
    
    const headers = new Headers({
    'Content-Type': 'application/json',
    'X-Shopify-Access-Token': saccesstoken
    });
    
    for(let i=0; i<items.length; i++){
    fetch(`https://equilibriumtestinglab.myshopify.com/admin/api/2023-01/variants/${items[i].variant_id}/metafields.json`,{headers:headers})
    .then(response => response.json())
    .then(metafields =>{
      console.log(metafields)
      let itemLimitObj = {}
      itemLimitObj[items[i].variant_id] = {qty: metafields.metafields.find(itemLimit=>itemLimit.key === 'customlimit')?.value ?? 99 };
      itemsLimitsArray.push(itemLimitObj)
    })
    .finally(()=> {
      window.productLimit = itemsLimitsArray
      console.log("finally",itemsLimitsArray)
    })
    .catch(error => console.error(error));
    }
    }//
    
    // checks if request is increasing items or adding items as far those are the only two options
    // to add items in shopify.
    //functions check which of the two possible addition items is being called in fetch 
    function isAddRequest(payloadString, cartItems, productLimit) {
    console.log(payloadString)
    const parsedPayload = parsePayload(payloadString);
    if (parsedPayload) {
    if (parsedPayload.hasOwnProperty("line")) {
    const itemLinePosition = parseInt(parsedPayload.line);
    console.log("cartitemsiteratedinlineupdates", cartItems, "itemlineposition", itemLinePosition)
    const itemId = cartItems[itemLinePosition - 1].id;
    const itemLimit = productLimit.find(el => el[itemId])[itemId].qty;
    const cartItemIndex = cartItems.findIndex(ci => ci.id === itemId);
    if (parsedPayload.quantity > itemLimit) {
      window.initialShopifyCart.items[cartItemIndex].quantity += 1;
    } else {
      window.initialShopifyCart.items[cartItemIndex].quantity = parsedPayload.quantity;
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
    console.log("308",window.initialShopifyCart.items)
    getMetafieldLimits(window.initialShopifyCart.items)
    return itemCurrentQuantity + 1> itemLimit;
    }else if(parsedPayload.hasOwnProperty("id") && !cartItems.length){
    const itemId = parseInt(parsedPayload.id);
    window.initialShopifyCart.items.unshift({id:itemId, variant_id:itemId, quantity:1})
    getMetafieldLimits(window.initialShopifyCart.items)
    }
    }
    return false;
    }
    
    
    //this is our mock. Limits are setting in global variable to be accessible for all the functions
    //that references this variable
    /*window.productLimit = [
    { 40120376459450: { qty: 2, isLimited: false } },
    { 40120367186106: { qty: 3, isLimited: false } }
    ];*/
    
    
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
    
    window.addEventListener("load", getLastCartState);
    
    //customize fetch in order to intercept and handle responses related to Shopify Cart
    //this just have effect on add/change requests and returns original fetch method
    //for other requests
    function fetchOverride() {
    if (!window.fetch || typeof window.fetch !== "function") return;
    
    const originalFetch = window.fetch;
    window.fetch = function() {
    let response;
    
    /*if(isShopifyCartURL(arguments[0])){
      getLastCartState()
    }*/
    
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
      else response = originalFetch.apply(this, arguments)
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