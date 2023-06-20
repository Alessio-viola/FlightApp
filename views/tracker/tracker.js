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

    // let code = 'RYR1199' // DEBUG: test code
    let code = $('#flightCode').val();
    //let airlineCode = code.slice(0, 3);
    //let flightCode = code.slice(3);
    //let url = new URL(`https://api.laminardata.aero/v1/airlines/${airlineCode}/flights/${flightCode}?`);
    //url.searchParams.append('user_key', 'c33b9571ea8ca09bad4dc89d5c88635d');
    
    //AVIATIONSTACK API
    //const accessKey = "24a092508e370f9f0cd0478ff7e877f5" 
    //let url = new URL(`http://api.aviationstack.com/v1/flights?access_key=${accessKey}&flight_iata=${code}`)
    //let url = new URL('https://localhost:3000/example-tracker-aviationstack.json'); // DEBUG uncomment url above and comment this to get real data

    $.get({
            url: url,
            success: function (res) {
                console.log(res)

                //elimino aereo precedente 
                const parentElement = document.getElementById("arc")
                const childElement = parentElement.firstChild;
                parentElement.removeChild(childElement);
                
                /* //laminardata api response
                if (res.features.length === 0) {
                    // Show error
                    vueContext.isLoading = false;
                    vueContext.isError = true;
                } else {
                    // Get the trip times
                    let obj = res.features[res.features.length - 1].properties
                    let depTime = obj.departure.runwayTime.estimated;
                    if (!depTime) depTime = obj.departure.runwayTime.actual
                    if (!depTime) depTime = obj.departure.runwayTime.initial
                    let arrTime = obj.arrival.runwayTime.estimated;
                    if (!arrTime) arrTime = obj.arrival.runwayTime.actual
                    if (!arrTime) arrTime = obj.arrival.runwayTime.initial
                    if (!depTime || !arrTime) {
                        vueContext.isLoading = false;
                        vueContext.isError = true;
                        return;
                    }*/

                    //aviation stack api response
                    if (res.data.length === 0) {
                        // Show error
                        vueContext.isLoading = false;
                        vueContext.isError = true;
                    } else {
                        let obj = res.data[0]
                        let depTime = obj.departure.estimated;
                        if (!depTime) depTime = obj.departure.actual;
                        let arrTime = obj.arrival.estimated;
                        if (!arrTime) arrTime = obj.arrival.actual
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




                        const depTimeUTC = new Date(depTime);
                        const arrTimeUTC = new Date(arrTime);
                        const now = new Date();

                        const arcPercentage = (now.getTime() - depTimeUTC.getTime()) / (arrTimeUTC.getTime() - depTimeUTC.getTime());
                        
                        console.log("arcPercentage",arcPercentage)

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