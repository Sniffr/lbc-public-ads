//links
var url_buy_1 = "https://localbitcoins.com/buy-bitcoins-online/.json";
var url_sell_2 = "https://localbitcoins.com/sell-bitcoins-online/.json";
var url_buy_last = "https://localbitcoins.com/buy-bitcoins-online/.json?page=-1"
var url_sell_last = "https://localbitcoins.com/sell-bitcoins-online/.json?page=-1"
var follow_url;
var url_last;

//arrays
var response_array = [];
var ad_array = [];

//essential variables holding useful values
var price;
var localStorage_buy = "buy";
var localStorage_sell = "sell";

//counters and placeholders
var index = 1;
var last_page = 0;
var start_index = 0;
var stop_index = 5;
var t0, t1;
var progress_val = 0;
let clear_table = 0;

//main function to loop through api pages and get the data stores it in ad_array ad local storage
async function main(url_option) {
    //initialize this here because it couldnt clear
    var url_array = [];
    console.log("starting main function to get " + url_option + " urls");

    //if called for the second time empty the arrays containing data
    if (ad_array.length > 2) {
        console.log("emptying arrays");
        ad_array.length = 0;
        response_array.length = 0;
        index = 0;
        console.log(ad_array, url_array, response_array);
    }

    //change links according to the requested url
    if (url_option === "BUY") {
        url_last = url_buy_last;
        follow_url = url_buy_1 + "?page=";
        url_array[0] = url_buy_1;
    } else if (url_option === "SELL") {
        url_last = url_sell_last;
        follow_url = url_sell_2 + "?page=";
        url_array[0] = url_sell_2;
    }

    //show and overlay with progress bar
    $.LoadingOverlay("show", {
        // Progress
        progress: true,
        progressAutoResize: true,
        progressResizeFactor: 0.25,
        progressColor: "#a0a0a0",
        progressClass: "",
        progressOrder: 5,
        progressFixedPosition: "",
        progressSpeed: 200,
        progressMin: 0,
        progressMax: 100,

        // Text
        text: "Getting data from lcbtc 0%",                                // String/Boolean
        textAnimation: "",                                // String/Boolean
        textAutoResize: true,                              // Boolean
        textResizeFactor: 0.5,                               // Float
        textColor: "#202020",                         // String/Boolean
        textClass: "",                                // String/Boolean
        textOrder: 4                                 // Integer

    });

    console.log(follow_url);
    console.log(url_last);

    //get the last page of the links
    last_page = await get_last_page(url_last).then(function (data) {
        return data.replace(follow_url, "")
    });

    //get the current price of btc
    price = await get_page("https://localbitcoins.com/api/equation/btc_in_usd*1").then(function (data) {
        return data.data;
    });
    $("#btc_price").val(price);

    //get the true last page
    last_page = parseInt(last_page) + 1;
    console.log("last page is " + last_page);
    console.log("price is " + price);

    //fill url array with links to be followed
    for (i = 2; i <= last_page; i++) {
        url_array[index] = follow_url + i;
        index++;
    }
    console.log("url_array");
    console.log(url_array);

    //take timestamp for perfomance
    t0 = performance.now()

    //run the function for calling all the api based on an array of urls

    await loop_all_links(url_array);

    //stop timing
    t1 = performance.now()

    console.log("api call time : " + millisToMinutesAndSeconds(t1 - t0));

    //make an ad list full of ads
    console.log("parsing a list of ads ");
    for (ad in response_array) {
        ad_array = ad_array.concat(response_array[ad].data.ad_list);
    }
    console.log(ad_array);

    //storing the data in local storage depending on the ads saved in ad array
    //try to save the object to file
    if (confirm("Do you want to download the ads as json ")) {
        try {
            console.log("saving to file");
            if (url_option === "BUY") {
                var obj = JSON.stringify(ad_array);
                download(obj, localStorage_buy + new Date().YYYYMMDDHHMMSS(), 'text/plain');

            } else if (url_option === "SELL") {
                var obj2 = JSON.stringify(ad_array);
                download(obj2, localStorage_sell + new Date().YYYYMMDDHHMMSS(), 'text/plain');
            }
        } catch (e) {
            // fires When localstorage gets full
            // you can handle error here or empty the local stora
            console.log(e);
        }
    } else {
        console.log("You pressed Cancel!");
    }


}

//loop thourgh sliced array of links and call the function to get the data
async function loop_all_links(url_array_arg) {

    //axios function
    for (i = 0; i <= last_page; i = i + 5) {
        progress_val = i / last_page * 100;
        $.LoadingOverlay("progress", progress_val);
        $.LoadingOverlay("text", "Getting data from lcbtc " + parseInt(progress_val )+ "%");
        var sliced_array = url_array_arg.slice(start_index, stop_index);
        await get_promises(sliced_array);
        console.log(response_array);
    }

    $.LoadingOverlay("hide");


}

//get time in'YYYYMMDDHHMMSS'
Object.defineProperty(Date.prototype, 'YYYYMMDDHHMMSS', {
    value: function () {
        function pad2(n) {  // always returns a string
            return (n < 10 ? '0' : '') + n;
        }

        return this.getFullYear() +
            pad2(this.getMonth() + 1) +
            pad2(this.getDate()) +
            pad2(this.getHours()) +
            pad2(this.getMinutes()) +
            pad2(this.getSeconds());
    }
});

//download the file
function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

//code to run 5 calls at a time usin axion
function get_promises(url_array_sections) {
    var new_array = [];
    for (url in url_array_sections) {
        new_array.push(get_page(url_array_sections[url]));
    }
    start_index += 5;
    stop_index += 5;
    return axios.all(new_array).then(axios.spread((...responses) => {
        response_array = response_array.concat(responses);
        return responses;
        // use/access the results
    })).catch(errors => {
        // react on errors.
    })


}

//gets promise of a page from axios
function get_page(url) {
    return axios.get(url).then(function (response) {
        return response.data;
    }).catch(function (error) {
    })
}

//get the last page of the loop
function get_last_page(url_last) {
    return axios.get(url_last).then(function (response) {
        return response.data.pagination.prev;
    }).catch(function (error) {
    })
}

//convert milisenconds to minutes for perfomace evaluation
function millisToMinutesAndSeconds(millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}


//load ads to  table on button click
function load_ads(load_table, ad_array) {

    console.log("loading ads ");
    console.log(ad_array.length + " objects");
    $.LoadingOverlay("show", {

        // Text
        text: "Getting data",                                // String/Boolean
        textAnimation: "",                                // String/Boolean
        textAutoResize: true,                              // Boolean
        textResizeFactor: 0.5,                               // Float
        textColor: "#202020",                         // String/Boolean
        textClass: "",                                // String/Boolean
        textOrder: 4                                 // Integer

    });
    if (clear_table === 1) {
        load_table.clear().draw();
        clear_table = 0;
    }
    for (ad in ad_array) {
        var percentage = (parseFloat(ad_array[ad].data.temp_price_usd) - price) / 100;
        load_table.row.add([

            ad_array[ad].data.ad_id,//country
            ad_array[ad].data.location_string,//country
            ad_array[ad].data.temp_price_usd,//price
            percentage.toFixed(2),//percentage
            ad_array[ad].data.online_provider + " : " + ad_array[ad].data.bank_name,//payment method
            ad_array[ad].data.trade_type,//trade type
            "<a href='" + ad_array[ad].actions.public_view + "'>link</a>",]).draw(false);//link
        $.LoadingOverlay("text", "Loading object " + ad + " of " + ad_array.length);

    }
    clear_table = 1;
    $.LoadingOverlay("hide",);

}

$(document).ready(function () {

    var js_table = $('#table_id').DataTable();
    //call api for buy function
    //add data to table after
    $("#lcbtcbuy_btn").click(async function () {
        $(this).attr("disabled", "disabled");
        await main("BUY");
        load_ads(js_table, ad_array);
        $(this).removeAttr("disabled");
    });

    //call api for SELL function
    //add data to table after

    $("#lcbtcsell_btn").click(async function () {
        $(this).attr("disabled", "disabled");
        await main("SELL");
        load_ads(js_table, ad_array);
        $(this).removeAttr("disabled");
    });


    //load data from file storage
    $("#localadsfile_btn").click(async function () {
        $.LoadingOverlay("show", {
            // Text
            text: "Getting data ",                                // String/Boolean
            textAnimation: "",                                // String/Boolean
            textAutoResize: true,                              // Boolean
            textResizeFactor: 0.5,                               // Float
            textColor: "#202020",                         // String/Boolean
            textClass: "",                                // String/Boolean
            textOrder: 4                                 // Integer

        });
        console.log("loading ads ");
        if ($('#input_file').get(0).files.length === 0) {
            alert("No files selected.");
        } else {
            console.log(ad_array.length);
            console.log("getting price");
            price = await get_page("https://localbitcoins.com/api/equation/btc_in_usd*1").then(function (data) {
                return data.data;
            });
            console.log("Done getting price");


            $("#btc_price").val(price);
            if (clear_table === 1) {
                console.log("clearing table");
                load_table.clear().draw();
                clear_table = 0;
                console.log("Done clearing table");

            }

            console.log("filling table ");

            for (ad in ad_array) {
                var percentage = (parseFloat(ad_array[ad].data.temp_price_usd) - price) / 100;
                js_table.row.add([
                    ad_array[ad].data.location_string,//country
                    ad_array[ad].data.temp_price_usd,//price
                    percentage.toFixed(2),//percentage
                    ad_array[ad].data.online_provider + " : " + ad_array[ad].data.bank_name,//payent menthod
                    ad_array[ad].data.trade_type,//trade type
                    "<a href='" + ad_array[ad].actions.public_view + "'>link</a>",]).draw(false);//link
            }
            $.LoadingOverlay("text", "Loading object " + ad + " of " + ad_array.length);
            console.log("done filling table ");
            $.LoadingOverlay("hide");
            clear_table =1;


        }


    });
})

$(document).on('change', '#input_file', function (event) {
    var reader = new FileReader();
    var jsonObj
    reader.onload = function (event) {
        jsonObj = JSON.parse(event.target.result);
        console.log("loaded object");
        ad_array = jsonObj;

    }

    reader.readAsText(event.target.files[0]);
});


//might need this later
// try {
//         if (url_option === "BUY") {
//             if (localStorage.getItem(localStorage_buy) === null) {
//                 localStorage.setItem(localStorage_buy, JSON.stringify(ad_array));
//
//             } else {
//                 localStorage.removeItem(localStorage_buy);
//                 localStorage.setItem(localStorage_buy, JSON.stringify(ad_array));
//
//             }
//         } else if (url_option === "SELL") {
//             if (localStorage.getItem(localStorage_sell) === null) {
//                 localStorage.setItem(localStorage_sell, JSON.stringify(ad_array));
//             } else {
//                 localStorage.removeItem(localStorage_sell);
//                 localStorage.setItem(localStorage_sell, JSON.stringify(ad_array));
//             }
//         }
//     } catch (e) {
//         // fires When localstorage gets full
//         // you can handle error here or empty the local storage
//         localStorage.clear();
//         if (url_option === "BUY") {
//             if (localStorage.getItem(localStorage_buy) === null) {
//                 localStorage.setItem(localStorage_buy, JSON.stringify(ad_array));
//             } else {
//                 localStorage.removeItem(localStorage_buy);
//                 localStorage.setItem(localStorage_buy, JSON.stringify(ad_array));
//
//             }
//
//         } else if (url_option === "SELL") {
//             if (localStorage.getItem(localStorage_sell) === null) {
//                 localStorage.setItem(localStorage_sell, JSON.stringify(ad_array));
//             } else {
//                 localStorage.removeItem(localStorage_sell);
//                 localStorage.setItem(localStorage_sell, JSON.stringify(ad_array));
//             }
//         }
//     }