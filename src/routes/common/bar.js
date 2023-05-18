function UnauthloginOrSignup(login, signup) {
    let f = document.querySelector("#unauthForm");
    if (login == true) {
        f.action = "http://localhost:3000/api/sign-in/";
    }
    if (signup == true) {
        f.action = "http://localhost:3000/api/sign-up/";
    }
}

/**
 * Adapts the navigation bar to the user's authentication state
 */
function adaptToAuthentication() {
    let authenticated = localStorage.getItem('authenticated') === 'true';
    if (authenticated) {
        let a = document.getElementById("unauthForm");
        document.getElementById("unauthForm").style.display = 'none'
    } else {
        document.getElementById("authForm").style.display = 'none'
    }
}

function logOut() {
    localStorage.setItem('authenticated', 'false');
    window.location.href = "/logout";
}