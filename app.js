const express = require("express");
const fs = require("fs");
const bodyParser = require('body-parser');
const { JSDOM } = require( "jsdom" );
const { window } = new JSDOM( "" );
const $ = require( "jquery" )( window );

const app = express();
const port = process.env.PORT || 2000;
const auth = {
    login: "a",
    pass: "a"
}
const path = "./data/notes.json";
let isAuth = false;

function updateModels(models) {
    const json = JSON.stringify(models, null, 2);
    fs.writeFileSync(path, json);
}

function addNote(note, date) {
    const models = getModels();

    for (const model of models) {
        if (model.date != date) continue;
        if (model) {
            model.notes.push(note);
        } else {
            models.push({ date, notes: [note] })
        }
    }

    updateModels(models);
}

function updateNote(note) {
    const models = getModels();

    for (const model of models) {
        const oldNote = model.notes.find(x => x.id == note.id);
        if (oldNote) {
            oldNote.title = note.title;
            oldNote.text = note.text;
            oldNote.photoUrl = note.photoUrl;
            break;
        }
    }

    updateModels(models);
}

function deleteNote(id) {
    const models = getModels();
    let index;

    for (const i in models) {
        const model = models[i];
        const oldNote = model.notes.find(x => x.id == id);
        if (oldNote) {
            model.notes = model.notes.filter(x => x.id != id);
            index = i;
            break;
        }
    }

    if (index != null) models.splice(index, 1);
    
    updateModels(models);
}

function getNote(id, models) {
    const file = fs.readFileSync(path);

    if (models == null)
    models = getModels();

    for (const model of models) {
        const note = model.notes.find(x => x.id == id);
        if (note) return note;
    }

    return null;
}

function getModels() {
    const file = fs.readFileSync(path);
    return JSON.parse(file);
}

function generateId() {
    const models = getModels();
    
    do {
        let id = Math.floor(Math.random()*1000000 + 1);
        if (!getNote(id, models)) return id;
    } while (true);
}

app.set("view engine", "hbs");

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(__dirname + '/public'));

app.use("/admin", (request, response, next) => {
    const user = request.query;

    if (user && user.login == auth.login && user.pass == auth.pass && !isAuth) {
        isAuth = true;
    }
    
    if (!isAuth) {
        //response.header({"Content-Type": "text/html; charset=utf-8"});
        response.status(401);
        response.send("Ошибка авторизации");
        isAuth = false;
    }

    next();
});

app.listen(port, () => {
    console.log(`App is running on http://localhost:${port}/`);
});

app.get("/", (request, response) => {
    response.render("index", getModels());
});

app.get("/info/:id", (request, response) => {
    const note = getNote(request.params.id);

    if (!note) response.redirect("/");

    response.render("info", note);
});

app.get("/admin/edit/:id", (request, response) => {
    const note = getNote(request.params.id);

    if (!note) response.redirect("/");

    response.render("edit-info", note);
});

app.get("/admin/add", (request, response) => {
    response.render("edit-info", {});
});

app.post("/admin/edit", (request, response) => {
    const editInfo = request.body;

    if (!editInfo) response.redirect("/");
    editInfo.id = Number(editInfo.id);

    const date = new Date().toLocaleDateString("ru-RU");

    let note = getNote(editInfo.id);
    
    if (note) {
        note.title = editInfo.title;
        note.text = editInfo.text;
        note.photoUrl = editInfo.photoUrl;
        
        updateNote(note);
    } else {
        note = {};
        note.id = generateId();
        note.title = editInfo.title;
        note.text = editInfo.text;
        note.photoUrl = editInfo.photoUrl;

        addNote(note, date);
    }

    response.redirect("/");
});

app.get("/admin/delete/:id", (request, response) => {
    let id = request.params.id;

    if (!id) response.redirect("/");
    
    deleteNote(Number(id));

    response.redirect("/");
});

app.get("/about", (request, response) => {
    response.render("about");
});

app.get("/*", (request, response) => {
    response.redirect("/");
});