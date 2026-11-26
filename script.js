
function processarAdocao() {

    var patrocinador = document.getElementById("patrocinador").value;
    var criatura = document.getElementById("criatura").value;
    var pendencia = document.getElementById("pendencia").checked;
    var guardiao = document.getElementById("guardiao").value;

    var resultado = document.getElementById("resultado");

    if (patrocinador == "" || criatura == "") {
        resultado.innerHTML = "Preencha todos os campos!";
        resultado.style.color = "orange";
    }

    else if (criatura == "indisponivel") {
        resultado.innerHTML = "Adoção recusada: criatura indisponível!";
        resultado.style.color = "red";
    }

    else if (pendencia == true) {
        resultado.innerHTML = "Adoção recusada: patrocinador possui pendências!";
        resultado.style.color = "red";
    }

    else if (guardiao == "") {
        resultado.innerHTML = "Aguardando autorização do guardião!";
        resultado.style.color = "orange";
    }

    else if (guardiao == "nao") {
        resultado.innerHTML = "Adoção recusada pelo guardião!";
        resultado.style.color = "red";
    }

    else {
        resultado.innerHTML = "Adoção aprovada! Primeiro relatório de bem-estar gerado. Bem-vindo, " + patrocinador + "!";
        resultado.style.color = "green";
    }

}
