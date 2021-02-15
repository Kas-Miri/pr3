var selectedTheme = localStorage.getItem("theme");
console.log("test");
if (!selectedTheme) {
    selectedTheme = "css/theme-light.css";
    localStorage.setItem("theme", selectedTheme);
}

$("#theme-switch").prop("checked", selectedTheme == "css/theme-dark.css");
$("#page-style").attr("href", selectedTheme);
$("#theme-label").text(selectedTheme == "css/theme-dark.css" ? "Тёмная тема" : "Светлая тема");

$("#theme-switch").change(function () {
    if ($(this).prop("checked")) {
        $("#page-style").attr("href", "css/theme-dark.css");
        $("#theme-label").text("Тёмная тема");
    }
    else {
        $("#page-style").attr("href", "css/theme-light.css");
        $("#theme-label").text("Светлая тема");
    }

    localStorage.setItem("theme", $("#page-style").attr("href"));
});