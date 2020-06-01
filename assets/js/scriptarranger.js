$(document).ready(function () {
    var lbc_url = "https://localbitcoins.com";
    var btc_usd = "/api/equation/btc_in_usd*1";
    axios.get(lbc_url + btc_usd)
        .then(function (response) {
            // handle success
            var price = response.data.data;
            //load table on button click
            $('#buy_btn').click(function () {
                loadJSON_Buy(function (response) {
                    // Parse JSON string into object
                    var ads = JSON.parse(response);
                    console.log(ads.length);
                    for (ad in ads) {
                        var percentage = (parseFloat(ads[ad].data.temp_price_usd) - price) / 100;
                        $("#table_id").append("<tr>" +
                            "<td>" + ads[ad].data.location_string + "</td>" +
                            "<td>" + ads[ad].data.temp_price_usd + "</td>" +
                            "<td>" + percentage.toFixed(2) + "</td>" +
                            "<td>" + ads[ad].data.online_provider + " : " + ads[ad].data.bank_name + "</td>" +
                            "<td>" + "<a href='" + ads[ad].actions.public_view + "'>link</a>" + "</td>" +
                            "</tr>");
                    }
                    $('#table_id').DataTable();

                });
            });
            //load table on button click
            $('#sell_btn').click(function () {
                loadJSON_Sell(function (response) {
                    // Parse JSON string into object
                    var ads = JSON.parse(response);
                    console.log(ads.length);
                    for (ad in ads) {
                        var percentage = (parseFloat(ads[ad].data.temp_price_usd) - price) / 100;
                        $("#table_id").append("<tr>" +
                            "<td>" + ads[ad].data.location_string + "</td>" +
                            "<td>" + ads[ad].data.temp_price_usd + "</td>" +
                            "<td>" + percentage.toFixed(2) + "</td>" +
                            "<td>" + ads[ad].data.online_provider + " : " + ads[ad].data.bank_name + "</td>" +
                            "<td>" + "<a href='" + ads[ad].actions.public_view + "'>link</a>" + "</td>" +
                            "</tr>");
                    }
                    $('#table_id').DataTable();

                });
            });

        })
        .catch(function (error) {
            // handle error
            console.log(error);
        })
        .then(function () {
            // always executed
        });

    //trying api methods until one works


})


function loadJSON_Sell(callback) {

    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'sell.json', true); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}

function loadJSON_Buy(callback) {

    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'buy.json', true); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}