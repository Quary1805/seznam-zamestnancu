/*
    Seznam zaměstnanců
    20. 9. 2021
    Matyáš Svrček

    Vanilla JavaScript (psal jsem ho ve škole bez knihoven...)
*/

// Globální proměné
var Data = {};
var Metadata = {
    Loaded : false,
    Selected : null
};
var Userdata = {};
const MonthLengths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// Inicializace po načtení webu
function Init() {
    // Načte seznam z předešlého sessionu
    Userdata = StorageSystem.Load();

    // Inicializace UI
    PopUps._Clear();

    // Načte seznam pracovních pozic z externí adresy
    Metadata.AJAX = new XMLHttpRequest;
    Metadata.AJAX.open('get', 'https://www.ibillboard.com/api/positions');
    Metadata.AJAX.responseType = 'json';
    Metadata.AJAX.send();
    Metadata.AJAX.onload = function() {
        Data = Metadata.AJAX.response;
        Metadata.Loaded = true;
        RenderList();
        document.getElementById('control_panel').removeAttribute('hidden');
    }
}

// Vypíše seznam zaměstnanců
function RenderList() {
    // Vymaže dosavadní obsah tabulky
    document.getElementById('main_table').innerHTML = "";

    // Fetchne filtr
    var FILTER = document.getElementById('search_text').value;

    // Zde je proměnná pro vyhledané zaměstnance odpovídající filtrům
    var EMPLOYEES = [];
    for (let i = 0; i < Userdata.List.length; i++) {
        const EMPLOYEE = Userdata.List[i];
        if (EMPLOYEE.first_name.indexOf(FILTER) != -1 || EMPLOYEE.last_name.indexOf(FILTER) != -1) {
            EMPLOYEES.push([EMPLOYEE, i]);
        }
    }

    // Vypíše počet zaměstnanců odpovídajících filtrům
    document.getElementById('table_info').innerText = "Nalezeno " + EMPLOYEES.length + ((EMPLOYEES.length == 1) ? " zaměstnanec." : (EMPLOYEES.length > 1 && EMPLOYEES.length < 5) ? " zaměstnanci." : " zaměstnanců.");

    // Tabulka je vykreslena, pokud existuje aspoň 1 zaměstnanec
    if (EMPLOYEES.length > 0) {
        // Vytvoří hlavičku tabulky
        var TR = document.createElement('tr');
        TR.innerHTML = "<th>Jméno</th><th>Příjmení</th><th>Pracovní pozice</th><th>Datum Narození</th>";
        document.getElementById('main_table').appendChild(TR);

        for (let index = 0; index < EMPLOYEES.length; index++) {
            const EMPLOYEE = EMPLOYEES[index][0];
            var TR2 = document.createElement('tr');
            if (EMPLOYEES[index][1] == Metadata.Selected) TR2.className = "pointer";
            TR2.setAttribute('onclick', 'SelectEmployee('+EMPLOYEES[index][1]+')')
            TR2.innerHTML = "<td>"+EMPLOYEE.first_name+"</td><td>"+EMPLOYEE.last_name+"</td><td>"+EMPLOYEE.position+"</td><td>"+EMPLOYEE.date_of_birth.toString().replaceAll(",", ". ")+"</td>";
            document.getElementById('main_table').appendChild(TR2);
        }
    }

    // Zobraz pracovníka
    document.getElementById('worpan_0').setAttribute('hidden', true);
    document.getElementById('worpan_1').setAttribute('hidden', true);
    if (Metadata.Selected == null) {
        document.getElementById('worpan_0').removeAttribute('hidden');
    } else {
        document.getElementById('worpan_name').innerText = EMPLOYEES[Metadata.Selected][0].first_name + " " + EMPLOYEES[Metadata.Selected][0].last_name;
        document.getElementById('worpan_position').innerText = EMPLOYEES[Metadata.Selected][0].position
        document.getElementById('worpan_date_of_birth').innerText = EMPLOYEES[Metadata.Selected][0].date_of_birth.toString().replaceAll(",", ". ");
        document.getElementById('worpan_1').removeAttribute('hidden');
    }
}

// Ukládací systém do localStorage pomocí JSONu
var StorageSystem = {
    // Načíst
    Load: function() {
        // Pokud je aplikace zapnutá poprvé, vytvoří nový klíč v localStorage
        if (localStorage.seznam_zamestancu == undefined || localStorage.seznam_zamestancu == "undefined") StorageSystem.Reset();
        return JSON.parse(localStorage.seznam_zamestancu)
    },
    // Uložit
    Save: function() {
        localStorage.seznam_zamestancu = JSON.stringify(Userdata);
    },
    // Reset localStorage
    Reset: function() {
        Userdata = {List:[]};
        StorageSystem.Save();
    }
}

// Vyčistí tabulku
function ClearTable() {
    if (Metadata.Loaded) {
        PopUps._Clear();
        StorageSystem.Reset();
        RenderList();
    }
}

// Vygeneruje X zaměstnanců (Debug funkce)
function GenerateEmployees(GEN_COUNT) {
    // Drobná kontrola vstupu
    if (isNaN(GEN_COUNT) || GEN_COUNT > 9999 || GEN_COUNT < 0 || !Metadata.Loaded) {
        alert("Neplatný vstup\n\nOčekáváno celé číslo v rozsahu 0 - 9999")
    } else {
        // Skryje dialogové okno
        PopUps._Clear();

        // Samotná generace
        for (let i = 0; i < GEN_COUNT; i++) {
            // Generování data narození
            var NEW_DATE_OF_BIRTH = [0, Math.ceil(Math.random()*12), Math.ceil(Math.random()*55)+1950];
            // Handler pro přestupné roky
            NEW_DATE_OF_BIRTH[0] = Math.ceil(Math.random()*((NEW_DATE_OF_BIRTH[1] == 2 && (NEW_DATE_OF_BIRTH[2] % 4) == 0) ? 29 : MonthLengths[NEW_DATE_OF_BIRTH[1]-1]))
            PushEmployee("Jméno_" + (Math.floor(Math.random()*9000)+1000), "Příjmení_" + (Math.floor(Math.random()*9000)+1000), Data.positions[Math.floor(Data.positions.length*Math.random())], NEW_DATE_OF_BIRTH);
        }

        // Update seznamu
        RenderList();
        StorageSystem.Save();
    }
}

// Správa vyskakovacích okýnek
var PopUps = {
    // Všechny skryje
    _Clear: function() {
        for (let a = 0; a < document.getElementsByClassName('popup').length; a++) {
            document.getElementsByClassName('popup')[a].setAttribute('hidden', true);
        }
    },
    // Dialog pro generování
    GenerateEmployees: function() {
        PopUps._Clear();
        document.getElementById('genemp_input').value = 100;
        document.getElementById('genemp').removeAttribute('hidden');
    },
    // Dialog pro vyčištění
    ClearTable: function() {
        PopUps._Clear();
        document.getElementById('cletab').removeAttribute('hidden');
    },
    // Dialog pro přidání zaměstnance
    AddEmployee: function() {
        PopUps._Clear();
        document.getElementById('addemp_first_name').value = "";
        document.getElementById('addemp_last_name').value = "";

        // Dát do <select> pozic všechny pozice
        document.getElementById('addemp_position').innerHTML = "";
        for (let i = 0; i < Data.positions.length; i++) {
            const POSITION = Data.positions[i];
            document.getElementById('addemp_position').innerHTML += "<option value='"+POSITION+"'>"+POSITION+"</option>"
        }

        // Dát do <select> dat všechny data
        document.getElementById('addemp_year').innerHTML = "";
        document.getElementById('addemp_month').innerHTML = "";
        document.getElementById('addemp_day').innerHTML = "";
        for (let i = 1900; i <= (new Date).getFullYear(); i++) {
            document.getElementById('addemp_year').innerHTML += "<option value='"+i+"'>"+i+"</option>"
        }
        for (let i = 1; i <= 12; i++) {
            document.getElementById('addemp_month').innerHTML += "<option value='"+i+"'>"+i+"</option>"
        }
        for (let i = 1; i <= 31; i++) {
            document.getElementById('addemp_day').innerHTML += "<option value='"+i+"'>"+i+"</option>"
        }
        document.getElementById('addemp_year').value = 1975;

        document.getElementById('addemp').removeAttribute('hidden');
    },
    // Dialog pro úpravu zaměstnance
    EditEmployee: function() {
        PopUps._Clear();

        const EMPLOYEE = Userdata.List[Metadata.Selected];

        document.getElementById('ediemp_first_name').value = EMPLOYEE.first_name;
        document.getElementById('ediemp_last_name').value = EMPLOYEE.last_name;

        // Dát do <select> pozic všechny pozice
        document.getElementById('ediemp_position').innerHTML = "";
        for (let i = 0; i < Data.positions.length; i++) {
            const POSITION = Data.positions[i];
            document.getElementById('ediemp_position').innerHTML += "<option value='"+POSITION+"'>"+POSITION+"</option>"
        }
        document.getElementById('ediemp_position').value = EMPLOYEE.position;

        document.getElementById('ediemp').removeAttribute('hidden');
    },
    // Dialog pro smazání zaměstnance
    RemoveEmployee: function() {
        PopUps._Clear();
        document.getElementById('rememp').removeAttribute('hidden');
    },
}

// Přidá zaměstnance s kontrolami snad na úplně vše
function PushEmployee(first_name, last_name, position, date_of_birth) {
    if (typeof(first_name) == "string" && typeof(last_name) == "string" && first_name != "" && last_name != "" && Data.positions.indexOf(position) != -1 && typeof(date_of_birth) == 'object') {
        var valid = true;
        if (date_of_birth.length != 3) valid = false;
        if (valid) if (typeof(date_of_birth[0]) != 'number') valid = false;
        if (valid) if (typeof(date_of_birth[1]) != 'number') valid = false;
        if (valid) if (typeof(date_of_birth[2]) != 'number') valid = false;
        if (valid) if (date_of_birth[1] < 1 || date_of_birth[1] > 12) valid = false;
        if (valid) if (date_of_birth[2] < 1800 || date_of_birth[2] > (new Date).getFullYear()) valid = false;
        if (valid) if (date_of_birth[0] < 1 || date_of_birth[0] > ((date_of_birth[1] == 2 && (date_of_birth[2] % 4) == 0) ? 29 : MonthLengths[date_of_birth[1]-1])) valid = false;
        if (valid) {
            Userdata.List.push({
                "first_name": first_name,
                "last_name": last_name,
                "position": position,
                "date_of_birth": date_of_birth
            })
        } else {
            console.error("Neplatné datum @ PushEmployee()")
            console.log(
                "first_name: "+ first_name+
                "\nlast_name: "+ last_name+
                "\nposition: "+ position+
                "\ndate_of_birth: (Expanded below)"
            );
            console.log(date_of_birth)
        }
    } else {
        console.error("Neplatné vstupy @ PushEmployee()")
        console.log(
            "first_name: "+ first_name+
            "\nlast_name: "+ last_name+
            "\nposition: "+ position+
            "\ndate_of_birth: (Expanded below)"
        );
        console.log(date_of_birth)
    }
}

// Přidat zaměstnance z dialogu
function AddEmployeeFromDialog() {
    if (document.getElementById('addemp_first_name').value == "" || document.getElementById('addemp_last_name').value == "") {
        alert('Některé pole je prázdné!');
    } else {
        if (Metadata.Loaded) {
            PushEmployee(
                document.getElementById('addemp_first_name').value,
                document.getElementById('addemp_last_name').value,
                document.getElementById('addemp_position').value,
                [
                    parseInt(document.getElementById('addemp_day').value),
                    parseInt(document.getElementById('addemp_month').value),
                    parseInt(document.getElementById('addemp_year').value)
                ]
            )
    
            PopUps._Clear();
            StorageSystem.Save();
            RenderList();
        }
    }
}

// Vybere/Odvybere zaměstnance
function SelectEmployee(id) {
    PopUps._Clear();
    Metadata.Selected = (Metadata.Selected == id) ? null : id;
    RenderList();
}

// Upraví zaměstnance
function EditEmployee() {
    if (document.getElementById('ediemp_first_name').value == "" || document.getElementById('ediemp_last_name').value == "" || Data.positions.indexOf(document.getElementById('ediemp_position').value) == -1) {
        alert('Některé pole je prázdné!');
    } else {
        if (Metadata.Loaded) {
            Userdata.List[Metadata.Selected].first_name = document.getElementById('ediemp_first_name').value;
            Userdata.List[Metadata.Selected].last_name = document.getElementById('ediemp_last_name').value;
            Userdata.List[Metadata.Selected].position = document.getElementById('ediemp_position').value;
    
            PopUps._Clear();
            StorageSystem.Save();
            RenderList();
        }
    }
}

// Smaže zaměstnance
function RemoveEmployee() {
    Userdata.List.splice(Metadata.Selected, 1);
    Metadata.Selected = null;
    RenderList();
    PopUps._Clear();
    StorageSystem.Save();
}