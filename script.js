document.addEventListener("DOMContentLoaded", function() {
    //The above event listener waits for the DOM content to be fully loaded before executing the code below

    //Selecting DOM elements and assigning them to variables
    const baseCurrencySelect = document.getElementById('base-currency');
    const targetCurrencySelect = document.getElementById('target-currency');
    const amountInput = document.getElementById('amount');
    const convertedAmountSpan = document.getElementById('converted-amount');
    const historicalRatesButton = document.getElementById('historical-rates');
    const historicalRatesContainer = document.getElementById('historical-rates-container');
    const saveFavoriteButton = document.getElementById('save-favorite');
    const favoriteCurrencyPairsDiv = document.getElementById('favorite-currency-pairs');

    //Fetch exchange rates from API
    fetch('https://api.exchangerate-api.com/v4/latest/USD')
        .then(response => response.json()) //Parses the JSON response into a data object
        .then(data => {
            //After the data is successfully fetched the following code will execute

            //Extracting rates from the API response
            const rates = data.rates;
            //Getting an array of currency codes from the rates object
            const currencies = Object.keys(rates);

            //Populating base and target currency select options
            currencies.forEach(currency => {
                //Creating option elements for each currency
                const option1 = document.createElement('option');
                option1.text = currency;
                option1.value = currency;
                const option2 = document.createElement('option');
                option2.text = currency;
                option2.value = currency;
                //Appending options to both base and target currency select elements
                baseCurrencySelect.add(option1);
                targetCurrencySelect.add(option2);
            });

            //Creating a function to convert currencies
            function convertCurrency() {
                const baseCurrency = baseCurrencySelect.value;
                const targetCurrency = targetCurrencySelect.value;
                const amount = parseFloat(amountInput.value);

                //Validating the input amount
                if (isNaN(amount)) {
                    convertedAmountSpan.textContent = 'Please enter a valid number.';
                    return;
                }

                //Checking if base currency and target currency are the same
                if (baseCurrency === targetCurrency) {
                    convertedAmountSpan.textContent = amount.toFixed(2) + ' ' + targetCurrency;
                    return;
                }

                //Performing the currency conversion calculation
                const baseRate = rates[baseCurrency];
                const targetRate = rates[targetCurrency];
                const convertedAmount = (amount / baseRate * targetRate).toFixed(2);

                //Displaying the converted amount in the target currency
                convertedAmountSpan.textContent = convertedAmount + ' ' + targetCurrency;
            }

            //Initializing conversion when inputs change
            baseCurrencySelect.addEventListener('change', convertCurrency);
            targetCurrencySelect.addEventListener('change', convertCurrency);
            amountInput.addEventListener('input', convertCurrency);

            //This section of code is for the historical rates button click event
            historicalRatesButton.addEventListener('click', function() { 
                //The line above sets up an event listener to execute the following code when the historical rates button is clicked
                const baseCurrency = baseCurrencySelect.value; //Retrieves the currently selected value from baseCurrencySelect
                const targetCurrency = targetCurrencySelect.value; //Retrieves the currently selected value from targetCurrencySelect

                //Fetching historical rates from API for the selected currency pair
                fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`)
                    //After the data is successfully retrieved from the API, the following code will execute
                    .then(response => response.json()) //Parses the JSON response into a data object
                    .then(data => {
                        const historicalRates = data.rates[targetCurrency]; //Extracts the exchange rate
                        const date = new Date(data.date); //Converts the date string from the API response into a date object

                        //Displays the historical rate in a readable format
                        //Formats the date to ISO string and extracts only the date
                        //toFixed(2) formats the exchange rate to 2 decimal places
                        historicalRatesContainer.textContent = `Historical exchange rate on ${date.toISOString().split('T')[0]}: 1 ${baseCurrency} = ${historicalRates.toFixed(2)} ${targetCurrency}`;
                    })
                    //Handling errors that might occur during the fetch operation
                    .catch(error => {
                        console.error('Error fetching historical data:', error);
                        historicalRatesContainer.textContent = 'Error fetching historical data. Please try again later.';
                    });
            });

            //This is the Save favorite button click event handler
            saveFavoriteButton.addEventListener('click', function() {
                //Creating a string representing the selected currency pair
                const favoritePair = `${baseCurrencySelect.value}_${targetCurrencySelect.value}`;
                //Retrieving existing favorite pairs from local storage or initialize an empty array
                const favoritePairs = JSON.parse(localStorage.getItem('favoritePairs')) || [];
                
                //Checking if the selected pair is already in favorites
                if (!favoritePairs.includes(favoritePair)) {
                    //If not already in favorites, adding it
                    favoritePairs.push(favoritePair);
                    //Saving updated favorite pairs to local storage
                    localStorage.setItem('favoritePairs', JSON.stringify(favoritePairs));
                    //Displaying the updated list of favorite pairs
                    favoriteCurrencyPairsDiv.textContent = `Saved favorite: ${favoritePairs.join(', ')}`;
                    displayFavoritePairs(); //Updates displayed favorite pairs
                } else {
                    //If the pair is already in favorites, alerting the user
                    alert('This pair is already in favorites.');
                }
            });

                   //Declaring a favorite pairs function that will render the list of favorite currency pairs in the favoriteCurrencyPairsDiv
                   function displayFavoritePairs() {
                    favoriteCurrencyPairsDiv.innerHTML = ''; //Clears old list before displaying the updated list of favorite pairs
    
                    //Retrieving the stored favorite pairs from localStorage and parsing the JSON string into an array
                    const favoritePairs = JSON.parse(localStorage.getItem('favoritePairs')) || [];
                    
                    favoritePairs.forEach(pair => {
                        const [base, target] = pair.split('_'); //Splits base and target currency
                        const listItem = document.createElement('button'); //Creates new button element for each pair
                        listItem.textContent = `${base}/${target}`; //Displays the pair as base/target
                        
                        //Adding an event listener to update the currency conversion display when a pair is selected from the favorites list
                        listItem.addEventListener('click', () => {
                            baseCurrencySelect.value = base;
                            targetCurrencySelect.value = target;
                            convertCurrency(); //Triggers favorite currency conversion to display on click
                        });
                        //Adding the new created favorite pair to the favoriteCurrencyPairsDiv
                        favoriteCurrencyPairsDiv.appendChild(listItem);
                    });
                }

            //Initial display of favorite pairs
            displayFavoritePairs();

        })
        .catch(error => {
            //Handling errors that occur during fetching or JSON parsing
            console.error('Error fetching data:', error);
        });
});
