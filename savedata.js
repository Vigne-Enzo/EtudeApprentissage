function savedata(data) {

    // Creating a XHR object
    let xhr = new XMLHttpRequest();
    let url = "savedata.php";

    // open a connection
    xhr.open("POST", url, true);

    // Set the request header i.e. which type of content you are sending
    xhr.setRequestHeader("Content-Type", "application/json");

    // Sending data with the request
    xhr.send(JSON.stringify(data));
}
