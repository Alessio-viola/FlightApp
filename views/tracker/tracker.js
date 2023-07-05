let vueContext;
let icaoJson = null;

$(document).ready(() => {
    Vue.createApp({
        data: function () {
            return {
                isLoading: false, // Whether we are executing the request to retrieve results
                isError: false, // Whether the API to retrieve results returned an error
                startCity: '',
                arrCity: '',
                depTimeStamp: '',
                arrTimeStamp: '',
                arcDegrees: -90,
            };
        },
        methods: {},
        mounted() {
            vueContext = this;
        }
    }).mount('#globalContainer');
})

async function retrieveFlightInfo() {
    vueContext.isLoading = true;

    let flightNumber = $('#flightCode').val();
    
    
    //AVIATIONSTACK API
    //const accessKey = "1aa26f3f41c3aa1f86d4554d94ab9063" 
    //let url = new URL(`http://api.aviationstack.com/v1/flights?access_key=${accessKey}&flight_icao=${code}`)
    let url = `/api/flight/${flightNumber}`
    //let url = new URL('https://localhost:3000/example-tracker-aviationstack.json'); // DEBUG uncomment url above and comment this to get real data

    $.get({
            url:url, 
            success: function (res) {
                
                if(res.data == undefined){//gestire caso di utente che non ha il prime 
                    vueContext.isError = true;
                    vueContext.isLoading = false;
                    if(prime == "false"){
                        $("#error-message").text("Non sei un utente prime").show();
                    }
                }

                //elimino aereo precedente 
                const parentElement = document.getElementById("arc")
                const childElement = parentElement.firstChild;
                if(childElement){
                    parentElement.removeChild(childElement);
                }
                
                    //aviation stack api response
                    if (res.data.length === 0) {
                        // Show error
                        vueContext.isLoading = false;
                        vueContext.isError = true;
                    } else {
                        let obj = res.data[0]
                        let depTime = obj.departure.actual_runway || obj.departure.estimated || obj.departure.scheduled;
                        let arrTime = obj.arrival.actual_runway || obj.arrival.estimated || obj.arrival.scheduled;

                        if (!depTime || !arrTime) {
                            vueContext.isLoading = false;
                            vueContext.isError = true;
                            return;
                        }
                    

                        // Get the trip starting and arriving point
                        //getCityFromICAO(obj.departure.aerodrome.scheduled).then(res => vueContext.startCity = res);
                        //getCityFromICAO(obj.arrival.aerodrome.scheduled).then(res => vueContext.arrCity = res);
                        vueContext.startCity = res.data[0].departure.airport
                        vueContext.arrCity = res.data[0].arrival.airport



                        //orario di partenza convertito a UTC
                        const depTimeUTC = new Date(depTime) //con questa riga lo converto in UTC 
                        //orario di arrivo convertito in UTC
                        const arrTimeUTC = new Date(arrTime)//con questa riga lo converto in UTC
                        
                        console.log(" arrivo UTC: ",arrTimeUTC);
                        
                        //orario now convertito in UTC
                        const nowLocal = new Date();//questo non è convertito in UTC
                        const nowUTC = new Date(nowLocal.getTime() - (nowLocal.getTimezoneOffset() * 60000));
                        console.log("now utc ",nowUTC)
                        
                        let arcPercentage;
                        if (depTimeUTC.getTime() > arrTimeUTC.getTime()) {
                            arcPercentage = (nowUTC.getTime() - arrTimeUTC.getTime()) / (depTimeUTC.getTime() - arrTimeUTC.getTime());
                        } else {
                            arcPercentage = (nowUTC.getTime() - depTimeUTC.getTime()) / (arrTimeUTC.getTime() - depTimeUTC.getTime());
                        }

                        console.log("arcPercentage", arcPercentage);
                        
                        const options = { 
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: 'numeric',
                            second: 'numeric'
                            //timeZoneName: 'short' 
                          };

                        vueContext.depTimeStamp = depTimeUTC.toLocaleString('it-IT', options) + " UTC"; 
                        vueContext.arrTimeStamp = arrTimeUTC.toLocaleString('it-IT', options) + " UTC";
                        

                        // Set the percentage in the right bound
                        if (arcPercentage < 0) arcPercentage = 0;
                        if (arcPercentage > 1) arcPercentage = 1;

                        // Convert the percentage to degrees
                        let arcDegrees = calcDegrees(arcPercentage);

                        // Start the animation
                        $('#arc').append('<div id="plane"><img src="/assets/icons/airplane-big.png" style="height: 80px; width: 80px;"/></div>');

                        // Calculate the animation
                        const plane = document.getElementById("plane");
                        const animKeyframe = new KeyframeEffect(
                            plane, // element to animate
                            [
                                {transform: "rotate(-180deg) translate(calc((60vw - 20px) / 2))"},
                                {transform: `rotate(${arcDegrees}deg) translate(calc((60vw - 20px) / 2))`},
                            ],
                            {duration: 3000, fill: "forwards"}
                        );
                        const animation = new Animation(
                            animKeyframe,
                            document.timeline
                        );
                        animation.play();

                        vueContext.isLoading = false;
                    }
                },
                error: function (err) {
                    console.log(err)
                    vueContext.isError = true;
                    vueContext.isLoading = false;
                }
            }
    )
}

function hideErrorMessage(){

    const input = document.getElementById("flightCode")
    input.addEventListener("input",()=>{
        vueContext.isError = false;
    })

}

async function getCityFromICAO(icao) {
    if (icaoJson === null) {
        try {
            icaoJson = await $.getJSON('/assets/data/icao-city.json');
        } catch (e) {
            console.log("The following error occurred while getting the city associated to a certain ICAO code:");
            console.log(e);
            return '';
        }
    }
    for (let i = 0; i < icaoJson.length; i++) {
        let el = icaoJson[i];
        if (el.icao === icao) {
            return el.city;
        }
    }
}

function calcDegrees(percentage) {
    return Math.floor(-180 + 180 * percentage);
}