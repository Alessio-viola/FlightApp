function showPassword(){
    const pass = document.getElementById("password")
    const showButton = document.getElementById("show-password-button")

    if (pass.type === "password"){
        pass.type = "text"
        showButton.textContent = "Nascondi"
    } else {
        pass.type = "password"
        showButton.textContent = "Mostra"
    }
}

function checkEmailInput(){
    const emailInput = document.getElementById("email")
    const regex = /^[A-z0-9\.\+_-]+@[A-z0-9\._-]+\.[A-z]{2,6}$/;

    emailInput.addEventListener("input",()=>{
        const emailValue = emailInput.value.trim()//trim() rimuove spazi vuoti a inizio e fine stringa
        if(emailValue == ""){
            emailInput.style.borderColor = ""
        }
        else if(regex.test(emailValue)){
            emailInput.style.borderColor = "#0c0"
        }else{
            emailInput.style.borderColor = "#c00"
        }
    })
}

function openPopup1() {
    document.getElementById("forgotPasswordPopup").style.display = "block";
    document.getElementById("signinForm").style.filter = 'blur(4px)';
    document.getElementById("error1").style.display = "none"
}

  function closePopup1() {
    document.getElementById("forgotPasswordPopup").style.display = "none";
    document.getElementById("signinForm").style.filter = 'none';
}

function openPopup2() {
    document.getElementById("tokenPopup").style.display = "block";
    document.getElementById("signinForm").style.filter = 'blur(4px)';
    document.getElementById("error2").style.display = "none"
}

  function closePopup2() {
    document.getElementById("tokenPopup").style.display = "none";
    document.getElementById("signinForm").style.filter = 'none';
}

function openPopup3() {
    document.getElementById("passwordPopup").style.display = "block";
    document.getElementById("signinForm").style.filter = 'blur(4px)';
    document.getElementById("error3").style.display = "none"
}

  function closePopup3() {
    document.getElementById("passwordPopup").style.display = "none";
    document.getElementById("signinForm").style.filter = 'none';
}
    

$(document).ready(function() {
    $('#signinForm').submit(function(event) {
      event.preventDefault();
      const email = $('#email').val();
      const password = $('#password').val();
      $.ajax({
        url: '/api/sign-in/',
        type: 'POST',
        data: {email: email, password: password},
        success: function(data) {
            console.log(data)
            if(data.code == "Success"){
                localStorage.setItem("email", email)
                localStorage.setItem('authenticated', 'true');
                localStorage.setItem('nameUser', data.username);
                window.location.href = "/";
            }
            else if(data.code == "too many requests"){
                $("#error-message").text("too many requests").show();
            }
            else{
                $("#error-message").text("Credenziali errate").show();
            }
        },
        error: function(xhr, status, error) {
            $("#error-message").text("Credenziali errate").show();      
        }
      });
    });
  });


$(document).ready(function() {
    $('#recoveryPasswordForm').submit(function(event) {
        event.preventDefault();
        const email = $('#recoveryEmail').val();
        $.ajax({
            url: '/forgot-password/',
            type: 'POST',
            data: {email: email},
            success:function(data){
                if(data.code == "Success"){
                    closePopup1();
                    openPopup2();
                }
                else{
                    $("#error1").text("Email scorretta").show(); 
                }
            },
            error: function(xhr, status, error) {
                      
            }
        });
        });
})

$(document).ready(function() {
    $('#tokenForm').submit(function(event) {
        event.preventDefault();
        const email = $('#recoveryEmail').val();
        const token = $('#recoveryToken').val();
        $.ajax({
            url: '/check-token/',
            type: 'POST',
            data: {email:email, token:token},
            success:function(data){
                if(data.code == "Success"){
                    console.log("Sto per chiudere il popup")
                    closePopup2();
                    openPopup3();
                }
                else{
                    $("#error2").text("Errore nell'inserimento del token").show();
                }
            },
            error: function(xhr, status, error) {
      
            }
        });
    });
})

$(document).ready(function() {
    $('#passwordForm').submit(function(event) {
        event.preventDefault();
        const newPassword = $('#recoveryPassword').val();
        const confNewPassword = $('#confirmRecoveryPassword').val();
        const email = $('#recoveryEmail').val();
        $.ajax({
            url: '/update-password/',
            type: 'POST',
            data: {password: newPassword, confPassword: confNewPassword, email: email},
            success: function(data){
                if(data.code == 'Success'){
                    closePopup3();
                }
                else{
                    $("#error3").text("Credenziali immesse errate").show();
                }
            },
            error: function(xhr, status, error) {
                     
            }
        })
    })
})


function hideErrorMessage(){
    
    const emailInput = document.getElementById("email")
    emailInput.addEventListener("input",()=>{
        document.getElementById("error-message").style.display = "none"
    })

    const passInput = document.getElementById("password")
    passInput.addEventListener("input",()=>{
        document.getElementById("error-message").style.display = "none"
    })

}